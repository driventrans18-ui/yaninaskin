import type { BlackoutDate, Booking, BookingSettings, BusinessShift } from './types';
import { preferredDate, hasChosenTime, statusOf } from './status';
import { addDays, dateKey, minutesOfTime, weekdayOf, zonedToUtc, timeOfMinutes } from '../tz';

export interface Interval {
  start: Date;
  end: Date;
}

export function shiftsForDate(dateKeyStr: string, settings: BookingSettings): BusinessShift[] {
  return settings.businessHours[String(weekdayOf(dateKeyStr))] ?? [];
}

export function blackoutFor(dateKeyStr: string, settings: BookingSettings): BlackoutDate | null {
  for (const b of settings.blackoutDates) {
    const from = b.from;
    const to = b.to || b.from;
    if (dateKeyStr >= from && dateKeyStr <= to) return b;
  }
  return null;
}

export function isOpenDay(dateKeyStr: string, settings: BookingSettings): boolean {
  return shiftsForDate(dateKeyStr, settings).length > 0 && !blackoutFor(dateKeyStr, settings);
}

export function overlaps(a: Interval, b: Interval, bufferMinutes = 0): boolean {
  const buf = bufferMinutes * 60000;
  return a.start.getTime() < b.end.getTime() + buf && b.start.getTime() < a.end.getTime() + buf;
}

// Appointment interval for a booking, or null when no time was chosen.
export function bookingInterval(b: Booking, durationMinutes: number): Interval | null {
  const at = preferredDate(b);
  if (!at || !hasChosenTime(b)) return null;
  return { start: at, end: new Date(at.getTime() + durationMinutes * 60000) };
}

export function blockedIntervals(settings: BookingSettings): (Interval & { label?: string })[] {
  return settings.blockedTimes
    .map((t) => ({ start: new Date(t.start), end: new Date(t.end), label: t.label }))
    .filter((i) => !Number.isNaN(i.start.getTime()) && !Number.isNaN(i.end.getTime()));
}

// Wall-clock interval of a shift on a given day, as instants.
export function shiftInterval(dateKeyStr: string, shift: BusinessShift, tz: string): Interval {
  return { start: zonedToUtc(dateKeyStr, shift.start, tz), end: zonedToUtc(dateKeyStr, shift.end, tz) };
}

export function withinBusinessHours(iv: Interval, settings: BookingSettings): boolean {
  const day = dateKey(iv.start, settings.timezone);
  return shiftsForDate(day, settings).some((s) => {
    const si = shiftInterval(day, s, settings.timezone);
    return iv.start.getTime() >= si.start.getTime() && iv.end.getTime() <= si.end.getTime();
  });
}

export interface SlotOptions {
  now?: Date;
  // Ignore minimum-notice / max-days rules (admin suggesting a time can pick any day).
  ignoreNotice?: boolean;
  // Intervals (with buffer already applied by the caller) that make a slot unavailable.
  busy?: Interval[];
  bufferMinutes?: number;
}

// Slot start instants a client could pick on a day for a service of `durationMinutes`.
export function slotsForDate(
  dateKeyStr: string,
  settings: BookingSettings,
  durationMinutes: number,
  opts: SlotOptions = {},
): Date[] {
  if (blackoutFor(dateKeyStr, settings)) return [];
  const now = opts.now ?? new Date();
  const earliest = opts.ignoreNotice ? now : new Date(now.getTime() + settings.minNoticeHours * 3600000);
  const latestDay = addDays(dateKey(now, settings.timezone), settings.maxDaysAhead);
  if (!opts.ignoreNotice && dateKeyStr > latestDay) return [];
  const busy = [...(opts.busy ?? []), ...blockedIntervals(settings)];
  const buffer = opts.bufferMinutes ?? settings.bufferMinutes;
  const out: Date[] = [];
  for (const shift of shiftsForDate(dateKeyStr, settings)) {
    const startMin = minutesOfTime(shift.start);
    const endMin = minutesOfTime(shift.end);
    for (let m = startMin; m + durationMinutes <= endMin; m += settings.slotMinutes) {
      const start = zonedToUtc(dateKeyStr, timeOfMinutes(m), settings.timezone);
      const iv = { start, end: new Date(start.getTime() + durationMinutes * 60000) };
      if (start.getTime() < earliest.getTime()) continue;
      if (busy.some((b) => overlaps(iv, b, buffer))) continue;
      out.push(start);
    }
  }
  return out;
}

export type ConflictKind = 'confirmed_overlap' | 'pending_overlap' | 'outside_hours' | 'blackout' | 'blocked';

export interface Conflict {
  kind: ConflictKind;
  withId?: string;
  withName?: string;
  label?: string;
}

// Everything the owner should know before confirming `target`.
export function detectConflicts(
  target: Booking,
  others: Booking[],
  settings: BookingSettings,
  durationOf: (b: Booking) => number,
  bufferOf: (b: Booking) => number = () => settings.bufferMinutes,
): Conflict[] {
  const iv = bookingInterval(target, durationOf(target));
  if (!iv) return [];
  const out: Conflict[] = [];
  const day = dateKey(iv.start, settings.timezone);
  const bo = blackoutFor(day, settings);
  if (bo) out.push({ kind: 'blackout', label: bo.label });
  else if (!withinBusinessHours(iv, settings)) out.push({ kind: 'outside_hours' });
  for (const bl of blockedIntervals(settings)) {
    if (overlaps(iv, bl, 0)) out.push({ kind: 'blocked', label: bl.label });
  }
  const buffer = bufferOf(target);
  for (const o of others) {
    if (o.id === target.id || o.deleted_at) continue;
    const s = statusOf(o);
    if (!['confirmed', 'new', 'contacted'].includes(s)) continue;
    const oi = bookingInterval(o, durationOf(o));
    if (!oi || !overlaps(iv, oi, buffer)) continue;
    out.push({
      kind: s === 'confirmed' ? 'confirmed_overlap' : 'pending_overlap',
      withId: o.id,
      withName: o.name,
    });
  }
  return out;
}

// Next `count` open slots that fit `durationMinutes`, skipping confirmed and
// pending appointments (plus buffer) and blocked times. Scans forward from
// `from` (default: now + minimum notice) for up to `maxDaysAhead` days.
export function suggestTimes(
  others: Booking[],
  settings: BookingSettings,
  durationMinutes: number,
  durationOf: (b: Booking) => number,
  opts: { count?: number; from?: Date; now?: Date; excludeId?: string; avoid?: Date[] } = {},
): Date[] {
  const now = opts.now ?? new Date();
  const count = opts.count ?? 3;
  const busy: Interval[] = [];
  for (const o of others) {
    if (o.deleted_at || o.id === opts.excludeId) continue;
    const s = statusOf(o);
    if (!['confirmed', 'new', 'contacted'].includes(s)) continue;
    const oi = bookingInterval(o, durationOf(o));
    if (oi) busy.push(oi);
  }
  const avoid = new Set((opts.avoid ?? []).map((d) => d.getTime()));
  const from = opts.from ?? new Date(now.getTime() + settings.minNoticeHours * 3600000);
  const out: Date[] = [];
  let day = dateKey(from, settings.timezone);
  const lastDay = addDays(dateKey(now, settings.timezone), Math.max(settings.maxDaysAhead, 14));
  while (out.length < count && day <= lastDay) {
    const slots = slotsForDate(day, settings, durationMinutes, { now: from, ignoreNotice: true, busy });
    for (const s of slots) {
      if (s.getTime() < from.getTime() || avoid.has(s.getTime())) continue;
      out.push(s);
      if (out.length >= count) break;
    }
    day = addDays(day, 1);
  }
  return out;
}
