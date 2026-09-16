import type { Booking, BookingStatus } from '@/lib/booking/types';
import type { AdminDict } from '../_components/AdminLang';
import { relativeDay } from '@/lib/booking/timing';
import { hasChosenTime, preferredDate } from '@/lib/booking/status';
import { formatDate, formatTime, formatDateKey, formatTimeKey, parseTimeLabel } from '@/lib/tz';

export function statusLabel(status: BookingStatus, t: AdminDict): string {
  switch (status) {
    case 'new':
      return t.statusNew;
    case 'contacted':
      return t.statusContacted;
    case 'confirmed':
      return t.statusConfirmed;
    case 'completed':
      return t.statusCompleted;
    case 'declined':
      return t.statusDeclined;
    case 'cancelled':
      return t.statusCancelled;
    case 'no_show':
      return t.statusNoShow;
    case 'archived':
      return t.statusArchived;
  }
}

export function methodLabel(method: string | null | undefined, t: AdminDict): string {
  switch (method) {
    case 'instagram':
      return t.methodInstagram;
    case 'email':
      return t.methodEmail;
    case 'call':
      return t.methodCall;
    default:
      return t.methodSms;
  }
}

// "Tomorrow, 6:00 PM" · "Tue, Sep 29 · 10:00 AM" · "Sep 29 (time not chosen)"
export function formatPreferred(
  b: Booking,
  opts: { lang: string; tz: string; t: AdminDict; now: Date; long?: boolean },
): string {
  const { lang, tz, t, now } = opts;
  const at = preferredDate(b);
  if (!at) {
    // Legacy rows may have a date string but no parseable instant.
    if (b.preferred_date) return formatDateKey(b.preferred_date, lang);
    return t.noDate;
  }
  const rel = relativeDay(at, now, tz);
  let day: string;
  if (rel.kind === 'today') day = t.today;
  else if (rel.kind === 'tomorrow') day = t.tomorrow;
  else if (rel.kind === 'yesterday') day = t.yesterday;
  else
    day = formatDate(at, lang, tz, opts.long ? { weekday: 'long', month: 'long', day: 'numeric' } : { weekday: 'short', month: 'short', day: 'numeric' });
  if (!hasChosenTime(b)) return `${day} · ${t.timeNotChosen}`;
  return `${day}, ${formatTime(at, lang, tz)}`;
}

// Date-only and time-only pieces for templates.
export function templateDateTime(at: Date, lang: string, tz: string): { date: string; time: string } {
  return {
    date: formatDate(at, lang, tz, { weekday: 'long', month: 'long', day: 'numeric' }),
    time: formatTime(at, lang, tz),
  };
}

// Human label for a legacy time label / HH:MM.
export function timeLabel(raw: string | null | undefined, lang: string): string {
  if (!raw) return '';
  const key = parseTimeLabel(raw);
  return key ? formatTimeKey(key, lang) : raw;
}

export function displayName(b: Booking, t: AdminDict): string {
  const n = (b.name || '').trim();
  if (!n || n.toLowerCase() === 'no name given') return t.bookingUnnamed;
  return n;
}

export function firstName(b: Booking, t: AdminDict): string {
  const n = displayName(b, t);
  return n.split(/\s+/)[0] || n;
}

export function relativeSubmitted(iso: string, lang: string): string {
  const d = new Date(iso);
  const diff = (d.getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(lang === 'uk' ? 'uk-UA' : 'en-US', { numeric: 'auto' });
  if (abs < 60) return rtf.format(0, 'minute');
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 86400 * 14) return rtf.format(Math.round(diff / 86400), 'day');
  return new Intl.DateTimeFormat(lang === 'uk' ? 'uk-UA' : 'en-US', { month: 'short', day: 'numeric' }).format(d);
}
