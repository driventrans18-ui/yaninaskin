import type { Booking, BookingStatus } from './types';
import { STATUS_RANK, statusOf } from './status';

const normalize = (s: string | null | undefined) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ');

const ANON_NAMES = new Set(['', 'no name given', 'без імені']);

// Who submitted this: phone first, then email, then (legacy rows) the name.
export function identityKey(b: Booking): string | null {
  if (b.phone_normalized) return `p:${b.phone_normalized}`;
  if (b.email_normalized) return `e:${b.email_normalized}`;
  const n = normalize(b.name);
  if (!ANON_NAMES.has(n)) return `n:${n}`;
  return null;
}

export function serviceKey(b: Booking): string {
  return normalize(b.service);
}

export interface TimeOption {
  at: string | null; // ISO instant (null when the submission had no time)
  preferred_date: string | null;
  preferred_time: string | null;
  bookingId: string;
}

export interface BookingGroup {
  key: string;
  primary: Booking;
  members: Booking[]; // oldest first
  count: number;
  options: TimeOption[]; // distinct preferred times across members
  unread: boolean;
}

function pickPrimary(members: Booking[]): Booking {
  // Most advanced status wins; ties go to the newest submission (usually the
  // most complete one).
  return [...members].sort((a, b) => {
    const r = STATUS_RANK[statusOf(b)] - STATUS_RANK[statusOf(a)];
    if (r !== 0) return r;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  })[0];
}

// Groups submissions from the same person for the same service made within
// `windowHours` of each other (chained: each member within the window of the
// previous one). Nothing is deleted or altered — this is a view over the rows.
export function groupDuplicates(bookings: Booking[], windowHours = 24): BookingGroup[] {
  const sorted = [...bookings].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const open = new Map<string, { members: Booking[]; last: number }>();
  const groups: { key: string; members: Booking[] }[] = [];
  const windowMs = windowHours * 3600000;
  for (const b of sorted) {
    const id = identityKey(b);
    const created = new Date(b.created_at).getTime();
    if (!id) {
      groups.push({ key: `solo:${b.id}`, members: [b] });
      continue;
    }
    const key = `${id}|${serviceKey(b)}`;
    const existing = open.get(key);
    if (existing && created - existing.last <= windowMs) {
      existing.members.push(b);
      existing.last = created;
    } else {
      const g = { members: [b], last: created };
      open.set(key, g);
      groups.push({ key: `${key}|${b.id}`, members: g.members });
    }
  }
  return groups.map(({ key, members }) => {
    const seen = new Set<string>();
    const options: TimeOption[] = [];
    for (const m of members) {
      const k = `${m.preferred_at ?? ''}|${m.preferred_date ?? ''}|${m.preferred_time ?? ''}`;
      if (seen.has(k)) continue;
      seen.add(k);
      options.push({
        at: m.preferred_at ?? null,
        preferred_date: m.preferred_date,
        preferred_time: m.preferred_time,
        bookingId: m.id,
      });
    }
    return {
      key,
      primary: pickPrimary(members),
      members,
      count: members.length,
      options,
      unread: members.some((m) => !m.read),
    };
  });
}

export function groupStatus(g: BookingGroup): BookingStatus {
  return statusOf(g.primary);
}
