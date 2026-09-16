'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Booking, BookingSettings } from '@/lib/booking/types';
import { statusOf } from '@/lib/booking/status';
import { bookingInterval, blockedIntervals, shiftsForDate, blackoutFor } from '@/lib/booking/availability';
import { addDays, dateKey, formatDateKey, minutesOfTime, startOfWeek, tzParts, weekdayOf } from '@/lib/tz';
import { useAdminT } from '../_components/AdminLang';
import { useIsMobile } from '../_components/ui/useMediaQuery';
import { displayName } from './bookingFormat';

const PX_PER_MIN = 0.9;

interface Item {
  id: string;
  kind: 'confirmed' | 'pending' | 'blocked';
  startMin: number;
  endMin: number;
  label: string;
  sub?: string;
}

export default function BookingCalendar({
  bookings,
  settings,
  durationOf,
  now,
  onOpen,
}: {
  bookings: Booking[];
  settings: BookingSettings;
  durationOf: (b: Booking) => number;
  now: Date;
  onOpen: (id: string) => void;
}) {
  const { t, lang, fmt } = useAdminT();
  const isMobile = useIsMobile();
  const tz = settings.timezone;
  const todayKey = dateKey(now, tz);
  const [mode, setMode] = useState<'day' | 'week'>('week');
  const [anchor, setAnchor] = useState(todayKey);
  // Phones start on the day view (the media query resolves after mount).
  const modeChosen = useRef(false);
  useEffect(() => {
    if (modeChosen.current) return;
    modeChosen.current = true;
    if (isMobile) setMode('day');
  }, [isMobile]);

  const days = useMemo(() => {
    if (mode === 'day') return [anchor];
    const start = startOfWeek(anchor);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [mode, anchor]);

  // Items per day, in wall-clock minutes of that day.
  const { itemsByDay, minHour, maxHour } = useMemo(() => {
    const map = new Map<string, Item[]>();
    let lo = 24 * 60;
    let hi = 0;
    for (const d of days) {
      map.set(d, []);
      for (const s of shiftsForDate(d, settings)) {
        lo = Math.min(lo, minutesOfTime(s.start));
        hi = Math.max(hi, minutesOfTime(s.end));
      }
    }
    const push = (day: string, it: Item) => {
      map.get(day)?.push(it);
      lo = Math.min(lo, it.startMin);
      hi = Math.max(hi, it.endMin);
    };
    for (const b of bookings) {
      if (b.deleted_at) continue;
      const st = statusOf(b);
      if (!['confirmed', 'new', 'contacted'].includes(st)) continue;
      const iv = bookingInterval(b, durationOf(b));
      if (!iv) continue;
      const day = dateKey(iv.start, tz);
      if (!map.has(day)) continue;
      const p = tzParts(iv.start, tz);
      const startMin = p.hour * 60 + p.minute;
      push(day, {
        id: b.id,
        kind: st === 'confirmed' ? 'confirmed' : 'pending',
        startMin,
        endMin: startMin + durationOf(b),
        label: displayName(b, t),
        sub: b.service || undefined,
      });
    }
    for (const bl of blockedIntervals(settings)) {
      const day = dateKey(bl.start, tz);
      if (!map.has(day)) continue;
      const p = tzParts(bl.start, tz);
      const startMin = p.hour * 60 + p.minute;
      const endMin = Math.min(24 * 60, startMin + Math.round((bl.end.getTime() - bl.start.getTime()) / 60000));
      push(day, { id: `blocked-${bl.start.toISOString()}`, kind: 'blocked', startMin, endMin, label: bl.label || t.calBlocked });
    }
    if (lo >= hi) {
      lo = 9 * 60;
      hi = 18 * 60;
    }
    return { itemsByDay: map, minHour: Math.floor(lo / 60), maxHour: Math.ceil(hi / 60) };
  }, [bookings, days, settings, durationOf, tz, t]);

  const hours = Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i);
  const gridHeight = (maxHour - minHour) * 60 * PX_PER_MIN;
  const step = mode === 'day' ? 1 : 7;
  const nowParts = tzParts(now, tz);
  const nowMin = nowParts.hour * 60 + nowParts.minute;

  const title =
    mode === 'day'
      ? formatDateKey(anchor, lang, { weekday: 'long', month: 'long', day: 'numeric' })
      : fmt(t.weekOf, { date: formatDateKey(days[0], lang, { month: 'long', day: 'numeric' }) });

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setAnchor(addDays(anchor, -step))} aria-label={t.calPrev} className="flex size-11 items-center justify-center rounded-full border border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button type="button" onClick={() => setAnchor(todayKey)} className="h-11 rounded-full border border-border px-4 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {t.calToday}
          </button>
          <button type="button" onClick={() => setAnchor(addDays(anchor, step))} aria-label={t.calNext} className="flex size-11 items-center justify-center rounded-full border border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
        <p className="font-serif text-lg">{title}</p>
        <div role="tablist" aria-label={t.viewCalendar} className="inline-flex rounded-full border border-border p-0.5">
          {(['day', 'week'] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              type="button"
              onClick={() => setMode(m)}
              className={`h-10 rounded-full px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${mode === m ? 'bg-foreground text-background' : 'text-muted-foreground'}`}
            >
              {m === 'day' ? t.calDay : t.calWeek}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-sm bg-foreground" /> {t.calConfirmed}</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-sm border border-dashed border-foreground/60 bg-accent/30" /> {t.calPending}</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-sm bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,var(--border)_2px,var(--border)_4px)]" /> {t.calBlocked}</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <div className="flex" style={{ minWidth: mode === 'week' ? 7 * 132 + 56 : undefined }}>
          {/* hour gutter */}
          <div className="sticky left-0 z-10 w-16 shrink-0 border-r border-border bg-card">
            <div className="h-12 border-b border-border" />
            <div className="relative" style={{ height: gridHeight }}>
              {hours.map((h) => (
                <span key={h} className="absolute -translate-y-1/2 whitespace-nowrap pl-2 text-[11px] text-muted-foreground" style={{ top: (h - minHour) * 60 * PX_PER_MIN }}>
                  {new Intl.DateTimeFormat(lang === 'uk' ? 'uk-UA' : 'en-US', { timeZone: 'UTC', hour: 'numeric' }).format(new Date(Date.UTC(2000, 0, 1, h)))}
                </span>
              ))}
            </div>
          </div>
          {days.map((d) => {
            const items = itemsByDay.get(d) ?? [];
            const shifts = shiftsForDate(d, settings);
            const closed = shifts.length === 0 || blackoutFor(d, settings);
            const isToday = d === todayKey;
            return (
              <div key={d} className={`relative min-w-0 flex-1 border-r border-border last:border-r-0 ${mode === 'week' ? 'w-[132px]' : ''}`}>
                <div className={`flex h-12 flex-col items-center justify-center border-b border-border text-xs ${isToday ? 'bg-accent/15' : ''}`}>
                  <span className="uppercase tracking-wider text-muted-foreground">{t.weekdayShort[weekdayOf(d)]}</span>
                  <span className={`font-serif text-base ${isToday ? 'rounded-full bg-foreground px-2 text-background' : ''}`}>{Number(d.slice(-2))}</span>
                </div>
                <div className="relative" style={{ height: gridHeight }}>
                  {/* hour lines */}
                  {hours.map((h) => (
                    <div key={h} className="absolute inset-x-0 border-t border-border/60" style={{ top: (h - minHour) * 60 * PX_PER_MIN }} />
                  ))}
                  {/* open hours shading */}
                  {closed ? (
                    <div className="absolute inset-0 bg-muted/60 text-center text-[11px] text-muted-foreground">
                      <span className="mt-4 inline-block">{t.calClosed}</span>
                    </div>
                  ) : (
                    shifts.map((s, i) => (
                      <div
                        key={i}
                        className="absolute inset-x-0 bg-background"
                        style={{ top: (minutesOfTime(s.start) - minHour * 60) * PX_PER_MIN, height: (minutesOfTime(s.end) - minutesOfTime(s.start)) * PX_PER_MIN }}
                      />
                    ))
                  )}
                  {isToday && nowMin >= minHour * 60 && nowMin <= maxHour * 60 && (
                    <div className="absolute inset-x-0 z-20 border-t-2 border-accent" style={{ top: (nowMin - minHour * 60) * PX_PER_MIN }} aria-hidden />
                  )}
                  {items.map((it) => {
                    const top = (it.startMin - minHour * 60) * PX_PER_MIN;
                    const height = Math.max(22, (it.endMin - it.startMin) * PX_PER_MIN - 2);
                    if (it.kind === 'blocked') {
                      return (
                        <div
                          key={it.id}
                          className="absolute inset-x-1 rounded-md bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,var(--border)_3px,var(--border)_6px)] px-1 text-[10px] text-muted-foreground"
                          style={{ top, height }}
                          title={it.label}
                        >
                          {it.label}
                        </div>
                      );
                    }
                    const confirmed = it.kind === 'confirmed';
                    return (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => onOpen(it.id)}
                        title={`${it.label}${it.sub ? ` · ${it.sub}` : ''}`}
                        className={`absolute inset-x-1 overflow-hidden rounded-lg px-1.5 py-1 text-left text-[11px] leading-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          confirmed ? 'bg-foreground text-background' : 'border border-dashed border-foreground/60 bg-accent/30 text-foreground'
                        }`}
                        style={{ top, height, zIndex: 10 }}
                      >
                        <span className="block truncate font-semibold">{it.label}</span>
                        {height > 34 && it.sub && <span className="block truncate opacity-80">{it.sub}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{fmt(t.timezoneNote, { tz })}</p>
    </div>
  );
}
