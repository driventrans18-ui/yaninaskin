import type { Booking } from './types';
import { statusOf, preferredDate } from './status';

export interface ClientProfile {
  key: string;
  name: string;
  phone: string | null;
  email: string | null;
  lang: string;
  bookings: Booking[]; // newest first
  requests: number;
  visits: number; // completed appointments
  upcoming: number; // confirmed in the future
  lastVisitAt: string | null;
  lastService: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
}

const normName = (s: string | null | undefined) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const ANON = new Set(['', 'no name given']);

// Keys a booking can be matched on, in priority order: phone → email → name.
export function clientKeys(b: Booking): string[] {
  const keys: string[] = [];
  if (b.phone_normalized) keys.push(`p:${b.phone_normalized}`);
  if (b.email_normalized) keys.push(`e:${b.email_normalized}`);
  if (keys.length === 0) {
    const n = normName(b.name);
    if (!ANON.has(n)) keys.push(`n:${n}`);
  }
  return keys;
}

// Union-find over bookings: any shared phone or email joins two bookings into
// the same client. Legacy rows (no phone/email) fall back to the name.
export function buildClients(bookings: Booking[], now: Date = new Date()): Map<string, ClientProfile> {
  const parent = new Map<string, string>();
  const find = (k: string): string => {
    let r = k;
    while (parent.get(r) !== r) r = parent.get(r) ?? r;
    // path compression
    let c = k;
    while (parent.get(c) !== r) {
      const next = parent.get(c) ?? r;
      parent.set(c, r);
      c = next;
    }
    return r;
  };
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };
  const keysOf = new Map<string, string[]>();
  for (const b of bookings) {
    if (b.deleted_at) continue;
    const keys = clientKeys(b);
    keysOf.set(b.id, keys);
    for (const k of keys) if (!parent.has(k)) parent.set(k, k);
    for (let i = 1; i < keys.length; i++) union(keys[0], keys[i]);
  }
  const groups = new Map<string, Booking[]>();
  for (const b of bookings) {
    const keys = keysOf.get(b.id);
    if (!keys || keys.length === 0) continue;
    const root = find(keys[0]);
    const arr = groups.get(root) ?? [];
    arr.push(b);
    groups.set(root, arr);
  }
  const out = new Map<string, ClientProfile>();
  for (const [root, list] of groups) {
    const sorted = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const withPhone = sorted.find((b) => b.phone_normalized);
    const withEmail = sorted.find((b) => b.email_normalized);
    const completed = sorted.filter((b) => statusOf(b) === 'completed');
    const upcoming = sorted.filter((b) => {
      const at = preferredDate(b);
      return statusOf(b) === 'confirmed' && at && at.getTime() >= now.getTime();
    });
    const lastVisit = completed
      .map((b) => preferredDate(b) ?? new Date(b.created_at))
      .sort((a, b) => b.getTime() - a.getTime())[0];
    const profile: ClientProfile = {
      key: root,
      name: sorted.find((b) => !ANON.has(normName(b.name)))?.name.trim() || sorted[0].name,
      phone: withPhone?.phone_normalized ?? null,
      email: withEmail?.email_normalized ?? null,
      lang: sorted[0].lang || 'en',
      bookings: sorted,
      requests: sorted.length,
      visits: completed.length,
      upcoming: upcoming.length,
      lastVisitAt: lastVisit ? lastVisit.toISOString() : null,
      lastService: (completed[0] ?? sorted[0]).service,
      firstSeenAt: sorted[sorted.length - 1].created_at,
      lastSeenAt: sorted[0].created_at,
    };
    out.set(root, profile);
    for (const b of sorted) out.set(`booking:${b.id}`, profile);
  }
  return out;
}

export function clientForBooking(map: Map<string, ClientProfile>, b: Booking): ClientProfile | undefined {
  return map.get(`booking:${b.id}`);
}
