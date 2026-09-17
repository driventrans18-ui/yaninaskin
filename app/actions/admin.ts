'use server';

import { requireAdmin } from '@/lib/requireAdmin';
import { getAdminClient } from '@/lib/supabaseAdmin';
import { isSchemaError } from '@/lib/dbErrors';
import { groupDuplicates } from '@/lib/booking/duplicates';
import type { Booking } from '@/lib/booking/types';

export interface AdminCounts {
  bookingsNeedsAction: number;
  bookingsUnread: number;
  bookingsUrgent: number;
  reviewsPending: number;
  messagesUnread: number;
  schemaOutdated: boolean;
}

const EMPTY: AdminCounts = {
  bookingsNeedsAction: 0,
  bookingsUnread: 0,
  bookingsUrgent: 0,
  reviewsPending: 0,
  messagesUnread: 0,
  schemaOutdated: false,
};

// Badge counts for the navigation. Cheap head-only queries.
export async function getAdminCounts(): Promise<AdminCounts> {
  try {
    await requireAdmin();
  } catch {
    return EMPTY;
  }
  const db = getAdminClient();
  const out: AdminCounts = { ...EMPTY };
  try {
    const soon = new Date(Date.now() + 48 * 3600000).toISOString();
    const now = new Date().toISOString();
    const [needs, unread, urgent] = await Promise.all([
      db
        .from('bookings')
        .select('id, name, service, phone_normalized, email_normalized, created_at, status, read, preferred_date, preferred_time, price, details, method')
        .in('status', ['new', 'contacted'])
        .is('deleted_at', null)
        .limit(2000),
      db.from('bookings').select('id', { count: 'exact', head: true }).eq('read', false).is('deleted_at', null),
      db
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .in('status', ['new', 'contacted'])
        .is('deleted_at', null)
        .gte('preferred_at', now)
        .lte('preferred_at', soon),
    ]);
    if (needs.error) throw needs.error;
    // Duplicate submissions show as one card in the inbox, so count cards.
    out.bookingsNeedsAction = groupDuplicates((needs.data || []) as Booking[]).length;
    out.bookingsUnread = unread.count ?? 0;
    out.bookingsUrgent = urgent.count ?? 0;
  } catch (err) {
    if (isSchemaError(err)) {
      out.schemaOutdated = true;
      const { count } = await db.from('bookings').select('id', { count: 'exact', head: true }).eq('read', false);
      out.bookingsNeedsAction = count ?? 0;
      out.bookingsUnread = count ?? 0;
    }
  }
  try {
    const r = await db.from('reviews').select('id', { count: 'exact', head: true }).eq('approved', false).is('deleted_at', null);
    if (r.error) throw r.error;
    out.reviewsPending = r.count ?? 0;
  } catch {
    const r = await db.from('reviews').select('id', { count: 'exact', head: true }).eq('approved', false);
    out.reviewsPending = r.count ?? 0;
  }
  try {
    const m = await db.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('read', false).is('deleted_at', null);
    if (m.error) throw m.error;
    out.messagesUnread = m.count ?? 0;
  } catch {
    const m = await db.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('read', false);
    out.messagesUnread = m.count ?? 0;
  }
  return out;
}

// Whether an LLM key is configured (the AI assist UI is hidden otherwise).
export async function getAiAvailability(): Promise<boolean> {
  try {
    await requireAdmin();
  } catch {
    return false;
  }
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// Whether owner email notifications can actually be sent (Settings shows a hint otherwise).
export async function getEmailProviderStatus(): Promise<{ configured: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { configured: false };
  }
  return { configured: Boolean(process.env.RESEND_API_KEY) };
}
