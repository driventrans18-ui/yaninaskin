'use client';

import { useMemo } from 'react';
import type { Booking, BookingSettings, ServiceLite } from '@/lib/booking/types';
import { groupDuplicates, type BookingGroup } from '@/lib/booking/duplicates';
import { buildClients, clientForBooking, type ClientProfile } from '@/lib/booking/clients';
import { detectConflicts, type Conflict } from '@/lib/booking/availability';
import { durationFor, bufferFor } from '@/lib/booking/duration';
import { timingOf, type Timing } from '@/lib/booking/timing';
import { segmentOf, statusOf, needsAction, preferredDate, type Segment } from '@/lib/booking/status';
import { dateKey, addDays, startOfWeek } from '@/lib/tz';

export interface GroupDecor {
  timing: Timing;
  conflicts: Conflict[];
  client: ClientProfile | undefined;
  segment: Segment;
  needsAction: boolean;
}

export interface BookingsModel {
  groups: BookingGroup[];
  decor: Map<string, GroupDecor>;
  clients: ClientProfile[];
  clientOf: (b: Booking) => ClientProfile | undefined;
  durationOf: (b: Booking) => number;
  summary: { replyToday: number; duplicatesMerged: number; conflicts: number; confirmedThisWeek: number };
  counts: Record<Segment | 'all', number>;
  serviceNames: string[];
}

export function useBookingsModel(
  bookings: Booking[],
  settings: BookingSettings,
  services: ServiceLite[],
  now: Date,
): BookingsModel {
  return useMemo(() => {
    const live = bookings.filter((b) => !b.deleted_at);
    const durationOf = (b: Booking) => durationFor(b, services, settings);
    const bufferOf = (b: Booking) => bufferFor(b, services, settings);
    const groups = groupDuplicates(live);
    const clientMap = buildClients(live, now);
    const decor = new Map<string, GroupDecor>();
    let replyToday = 0;
    let duplicatesMerged = 0;
    let conflictsCount = 0;
    const counts: Record<Segment | 'all', number> = { needs_action: 0, confirmed: 0, past: 0, archived: 0, all: 0 };
    for (const g of groups) {
      const p = g.primary;
      const timing = timingOf(p, now);
      const status = statusOf(p);
      const conflicts = ['new', 'contacted', 'confirmed'].includes(status) && timing !== 'expired' ? detectConflicts(p, live, settings, durationOf, bufferOf) : [];
      const segment = segmentOf(p, now);
      const na = needsAction(p);
      decor.set(g.key, { timing, conflicts, client: clientForBooking(clientMap, p), segment, needsAction: na });
      if (na && timing === 'urgent') replyToday += 1;
      if (g.count > 1) duplicatesMerged += g.count - 1;
      if (conflicts.some((c) => c.kind === 'confirmed_overlap' || c.kind === 'pending_overlap')) conflictsCount += 1;
      counts[segment] += 1;
      counts.all += 1;
    }
    const weekStart = startOfWeek(dateKey(now, settings.timezone));
    const weekEnd = addDays(weekStart, 7);
    const confirmedThisWeek = live.filter((b) => {
      if (statusOf(b) !== 'confirmed') return false;
      const at = preferredDate(b);
      if (!at) return false;
      const k = dateKey(at, settings.timezone);
      return k >= weekStart && k < weekEnd;
    }).length;
    const seen = new Set<string>();
    const clients: ClientProfile[] = [];
    for (const c of clientMap.values()) {
      if (seen.has(c.key)) continue;
      seen.add(c.key);
      clients.push(c);
    }
    clients.sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());
    const serviceNames = Array.from(new Set(live.map((b) => (b.service || '').trim()).filter(Boolean))).sort();
    return {
      groups,
      decor,
      clients,
      clientOf: (b: Booking) => clientForBooking(clientMap, b),
      durationOf,
      summary: { replyToday, duplicatesMerged, conflicts: conflictsCount, confirmedThisWeek },
      counts,
      serviceNames,
    };
  }, [bookings, settings, services, now]);
}
