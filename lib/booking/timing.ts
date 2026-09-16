import type { Booking } from './types';
import { preferredDate, hasChosenTime } from './status';
import { dateKey, daysBetween } from '../tz';

export type Timing = 'expired' | 'urgent' | 'soon' | 'later' | 'unknown';

export const URGENT_HOURS = 48;

// How pressing a request is relative to its preferred time.
export function timingOf(b: Booking, now: Date): Timing {
  const at = preferredDate(b);
  if (!at) return 'unknown';
  const diffH = (at.getTime() - now.getTime()) / 3600000;
  // Without a chosen time the day counts as "expired" only once it is over.
  if (!hasChosenTime(b)) {
    if (diffH < -24) return 'expired';
  } else if (diffH < 0) return 'expired';
  if (diffH <= URGENT_HOURS) return 'urgent';
  if (diffH <= 24 * 7) return 'soon';
  return 'later';
}

export type RelativeDay =
  | { kind: 'today' }
  | { kind: 'tomorrow' }
  | { kind: 'yesterday' }
  | { kind: 'weekday'; days: number }
  | { kind: 'date' };

// Relative day bucket for compact cards ("Tomorrow, 6:00 PM").
export function relativeDay(date: Date, now: Date, tz: string): RelativeDay {
  const diff = daysBetween(dateKey(now, tz), dateKey(date, tz));
  if (diff === 0) return { kind: 'today' };
  if (diff === 1) return { kind: 'tomorrow' };
  if (diff === -1) return { kind: 'yesterday' };
  if (diff > 1 && diff < 7) return { kind: 'weekday', days: diff };
  return { kind: 'date' };
}
