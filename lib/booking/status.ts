import type { Booking, BookingStatus } from './types';
import { NEEDS_ACTION_STATUSES } from './types';

export const STATUS_RANK: Record<BookingStatus, number> = {
  confirmed: 7,
  completed: 6,
  no_show: 5,
  contacted: 4,
  new: 3,
  declined: 2,
  cancelled: 1,
  archived: 0,
};

export function statusOf(b: Booking): BookingStatus {
  return (b.status as BookingStatus) || 'new';
}

export function needsAction(b: Booking): boolean {
  return NEEDS_ACTION_STATUSES.includes(statusOf(b));
}

export function preferredDate(b: Booking): Date | null {
  if (!b.preferred_at) return null;
  const d = new Date(b.preferred_at);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function hasChosenTime(b: Booking): boolean {
  return Boolean(b.preferred_at && b.preferred_time);
}

// Which inbox segment a booking belongs to.
export type Segment = 'needs_action' | 'confirmed' | 'past' | 'archived';

export function segmentOf(b: Booking, now: Date): Segment {
  const s = statusOf(b);
  if (s === 'archived') return 'archived';
  if (s === 'new' || s === 'contacted') return 'needs_action';
  const at = preferredDate(b);
  if (s === 'confirmed') return at && at.getTime() < now.getTime() ? 'past' : 'confirmed';
  return 'past';
}

// Legal next steps from a status (the UI shows these as primary actions).
export function transitionsFor(s: BookingStatus): BookingStatus[] {
  switch (s) {
    case 'new':
      return ['contacted', 'confirmed', 'declined', 'archived'];
    case 'contacted':
      return ['confirmed', 'declined', 'archived', 'new'];
    case 'confirmed':
      return ['completed', 'no_show', 'cancelled', 'archived'];
    case 'completed':
      return ['archived'];
    case 'no_show':
      return ['confirmed', 'archived'];
    case 'declined':
    case 'cancelled':
      return ['new', 'archived'];
    case 'archived':
      return ['new'];
  }
}
