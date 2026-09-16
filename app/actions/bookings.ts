'use server';

import { headers } from 'next/headers';
import { createHash } from 'node:crypto';
import { requireAdmin } from '@/lib/requireAdmin';
import { getAdminClient, getAnonClient, hasServiceRole } from '@/lib/supabaseAdmin';
import { isSchemaError, errorMessage } from '@/lib/dbErrors';
import { normalizePhone, normalizeEmail } from '@/lib/phone';
import { isValidDateKey, isValidTimeKey, parseTimeLabel, zonedToUtc, dateKey, timeKey } from '@/lib/tz';
import { settingsFromRow, serviceLiteFromRow } from '@/lib/booking/settings';
import { findService } from '@/lib/booking/duration';
import { shiftsForDate } from '@/lib/booking/availability';
import type { Booking, BookingEvent, BookingSettings, BookingStatus, ServiceLite } from '@/lib/booking/types';
import { BOOKING_STATUSES } from '@/lib/booking/types';
import { notifyNewBooking } from './notify';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
type Result<T = undefined> =
  | ({ success: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { success: false; error: string; schemaOutdated?: boolean };

const sha = (s: string) => createHash('sha256').update(s).digest('hex');

async function loadSettingsAndServices(): Promise<{ settings: BookingSettings; services: ServiceLite[] }> {
  const db = getAdminClient();
  const [about, services] = await Promise.all([
    db.from('about_content').select('*').limit(1).maybeSingle(),
    db.from('services').select('*'),
  ]);
  return {
    settings: settingsFromRow((about.data as Record<string, unknown> | null) ?? null),
    services: (services.data || []).map((s) => serviceLiteFromRow(s as Record<string, unknown>)),
  };
}

async function logEvent(
  bookingId: string,
  ev: { type: string; from_status?: string | null; to_status?: string | null; note?: string | null; actor?: string },
) {
  try {
    await getAdminClient()
      .from('booking_events')
      .insert([{ booking_id: bookingId, type: ev.type, from_status: ev.from_status ?? null, to_status: ev.to_status ?? null, note: ev.note ?? null, actor: ev.actor ?? 'admin' }]);
  } catch (err) {
    // Un-migrated DB: events are best-effort.
    console.warn('booking_events insert skipped:', errorMessage(err));
  }
}

// ---------------------------------------------------------------------------
// PUBLIC: submit a booking request (validated, spam-checked, idempotent)
// ---------------------------------------------------------------------------
export interface BookingInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  service?: string | null;
  price?: string | null;
  preferredDate?: string | null; // YYYY-MM-DD
  preferredTime?: string | null; // HH:MM (24h) or a legacy label
  details?: string | null;
  method: 'sms' | 'instagram' | 'email' | 'call';
  lang?: string | null;
  // Honeypot — real users never fill this in.
  website?: string | null;
}

export type SubmitBookingResult =
  | { success: true; id: string | null; duplicate: boolean }
  | { success: false; error: string; code: 'validation' | 'rate_limited' | 'server'; field?: string };

const RATE_LIMITS = { ip: { max: 8, windowMin: 60 }, phone: { max: 4, windowMin: 60 } };

async function rateLimited(bucket: string, max: number, windowMin: number): Promise<boolean> {
  const db = getAdminClient();
  const since = new Date(Date.now() - windowMin * 60000).toISOString();
  try {
    const { count, error } = await db
      .from('rate_limit_hits')
      .select('id', { count: 'exact', head: true })
      .eq('bucket', bucket)
      .gte('created_at', since);
    if (error) throw error;
    if ((count ?? 0) >= max) return true;
    await db.from('rate_limit_hits').insert([{ bucket }]);
    return false;
  } catch (err) {
    // Table missing (migration not run yet) → don't block real clients.
    console.warn('rate limit skipped:', errorMessage(err));
    return false;
  }
}

export async function submitBooking(input: BookingInput): Promise<SubmitBookingResult> {
  try {
    // Honeypot: bots fill hidden fields. Pretend it worked, store nothing.
    if (input.website && String(input.website).trim()) return { success: true, id: null, duplicate: false };

    const name = (input.name || '').trim().slice(0, 80);
    const method = (['sms', 'instagram', 'email', 'call'] as const).includes(input.method) ? input.method : 'sms';
    const lang = input.lang === 'uk' ? 'uk' : input.lang === 'es' ? 'es' : 'en';
    const details = (input.details || '').trim().slice(0, 2000) || null;
    const service = (input.service || '').trim().slice(0, 160) || null;
    const price = (input.price || '').trim().slice(0, 40) || null;

    if (!name) return { success: false, error: 'Please enter your name.', code: 'validation', field: 'name' };

    const phoneNorm = input.phone ? normalizePhone(input.phone) : null;
    if (input.phone && String(input.phone).trim() && !phoneNorm)
      return { success: false, error: 'Please enter a valid phone number.', code: 'validation', field: 'phone' };
    if ((method === 'sms' || method === 'call') && !phoneNorm)
      return { success: false, error: 'Please enter your phone number.', code: 'validation', field: 'phone' };

    const emailNorm = input.email ? normalizeEmail(input.email) : null;
    if (input.email && String(input.email).trim() && !emailNorm)
      return { success: false, error: 'Please enter a valid email address.', code: 'validation', field: 'email' };
    if (method === 'email' && !emailNorm)
      return { success: false, error: 'Please enter your email address.', code: 'validation', field: 'email' };

    const { settings, services } = await loadSettingsAndServices();
    const tz = settings.timezone;

    // Date/time: accept YYYY-MM-DD + HH:MM (new form) or a legacy label.
    let preferredDate: string | null = null;
    let preferredTime: string | null = null;
    let preferredAt: Date | null = null;
    if (input.preferredDate) {
      if (!isValidDateKey(input.preferredDate))
        return { success: false, error: 'Please choose a valid date.', code: 'validation', field: 'date' };
      preferredDate = input.preferredDate;
      const today = dateKey(new Date(), tz);
      if (preferredDate < today)
        return { success: false, error: 'That date has already passed.', code: 'validation', field: 'date' };
      const t = input.preferredTime ? (isValidTimeKey(input.preferredTime) ? input.preferredTime : parseTimeLabel(input.preferredTime)) : null;
      if (input.preferredTime && !t)
        return { success: false, error: 'Please choose a valid time.', code: 'validation', field: 'time' };
      preferredTime = t ? t.padStart(5, '0') : null;
      const fallback = shiftsForDate(preferredDate, settings)[0]?.start ?? '09:00';
      preferredAt = zonedToUtc(preferredDate, preferredTime ?? fallback, tz);
    }

    // Rate limiting by IP and phone.
    const h = await headers();
    const ip = (h.get('x-forwarded-for') || h.get('x-real-ip') || '').split(',')[0].trim();
    const ipHash = ip ? sha(`ip:${ip}:${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}`).slice(0, 32) : null;
    if (ipHash && (await rateLimited(`ip:${ipHash}`, RATE_LIMITS.ip.max, RATE_LIMITS.ip.windowMin)))
      return { success: false, error: 'Too many requests. Please try again in an hour.', code: 'rate_limited' };
    if (phoneNorm && (await rateLimited(`phone:${phoneNorm}`, RATE_LIMITS.phone.max, RATE_LIMITS.phone.windowMin)))
      return { success: false, error: 'Too many requests from this number. Please try again later.', code: 'rate_limited' };

    const svc = findService(services, service);
    const identity = phoneNorm || emailNorm || name.toLowerCase();
    const submissionKey = sha([identity, (service || '').toLowerCase(), preferredDate || '', preferredTime || ''].join('|'));
    const db = hasServiceRole() ? getAdminClient() : getAnonClient();

    // Idempotency: the same person + service + slot within 10 minutes is one request.
    try {
      const since = new Date(Date.now() - 10 * 60000).toISOString();
      const { data: dup } = await getAdminClient()
        .from('bookings')
        .select('id, submission_count, details')
        .eq('submission_key', submissionKey)
        .is('deleted_at', null)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (dup?.id) {
        await getAdminClient()
          .from('bookings')
          .update({
            submission_count: (dup.submission_count ?? 1) + 1,
            last_submitted_at: new Date().toISOString(),
            // Keep the longest message the client wrote.
            details: details && (!dup.details || details.length > dup.details.length) ? details : dup.details,
          })
          .eq('id', dup.id);
        await logEvent(dup.id, { type: 'resubmitted', actor: 'client', note: method });
        return { success: true, id: dup.id, duplicate: true };
      }
    } catch (err) {
      if (!isSchemaError(err)) console.warn('idempotency check failed:', errorMessage(err));
    }

    const fullRow = {
      name,
      service,
      price: price ?? svc?.price ?? null,
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      details,
      method,
      phone: phoneNorm,
      phone_normalized: phoneNorm,
      email: emailNorm,
      email_normalized: emailNorm,
      status: 'new',
      lang,
      preferred_at: preferredAt ? preferredAt.toISOString() : null,
      duration_minutes: svc?.durationMinutes ?? null,
      submission_key: submissionKey,
      submission_count: 1,
      last_submitted_at: new Date().toISOString(),
      ip_hash: ipHash,
    };

    let inserted: { id: string } | null = null;
    const first = await db.from('bookings').insert([fullRow]).select('id').single();
    if (first.error) {
      if (!isSchemaError(first.error)) throw first.error;
      // Migration not run yet: fall back to the legacy columns so no request is lost.
      const legacy = await db
        .from('bookings')
        .insert([{ name, service, price: fullRow.price, preferred_date: preferredDate, preferred_time: preferredTime, details, method: method === 'instagram' ? 'instagram' : 'sms' }])
        .select('id')
        .single();
      if (legacy.error) throw legacy.error;
      inserted = legacy.data;
    } else {
      inserted = first.data;
    }
    if (inserted?.id) {
      await logEvent(inserted.id, { type: 'created', to_status: 'new', actor: 'client', note: method });
      const booking: Booking = { ...(fullRow as unknown as Booking), id: inserted.id, read: false, created_at: new Date().toISOString() };
      await notifyNewBooking(booking, settings).catch(() => undefined);
    }
    return { success: true, id: inserted?.id ?? null, duplicate: false };
  } catch (err) {
    console.error('Error submitting booking:', err);
    return { success: false, error: errorMessage(err, 'Failed to submit booking'), code: 'server' };
  }
}

// ---------------------------------------------------------------------------
// ADMIN: read
// ---------------------------------------------------------------------------
export async function getBookings(opts: { trashed?: boolean } = {}): Promise<{
  success: boolean;
  data: Booking[];
  schemaOutdated: boolean;
  error?: string;
}> {
  try {
    await requireAdmin();
    const db = getAdminClient();
    const base = db.from('bookings').select('*').order('created_at', { ascending: false }).limit(2000);
    const q = opts.trashed ? base.not('deleted_at', 'is', null) : base.is('deleted_at', null);
    const { data, error } = await q;
    if (error) {
      if (!isSchemaError(error)) throw error;
      if (opts.trashed) return { success: true, data: [], schemaOutdated: true };
      const legacy = await db.from('bookings').select('*').order('created_at', { ascending: false });
      if (legacy.error) throw legacy.error;
      return { success: true, data: (legacy.data || []) as Booking[], schemaOutdated: true };
    }
    return { success: true, data: (data || []) as Booking[], schemaOutdated: false };
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return { success: false, data: [], schemaOutdated: isSchemaError(err), error: errorMessage(err) };
  }
}

export async function getBookingEvents(bookingId: string): Promise<{ success: boolean; data: BookingEvent[] }> {
  try {
    await requireAdmin();
    const { data, error } = await getAdminClient()
      .from('booking_events')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return { success: true, data: (data || []) as BookingEvent[] };
  } catch (err) {
    if (!isSchemaError(err)) console.error('Error fetching booking events:', err);
    return { success: false, data: [] };
  }
}

// ---------------------------------------------------------------------------
// ADMIN: write
// ---------------------------------------------------------------------------
const STATUS_STAMP: Partial<Record<BookingStatus, string>> = {
  contacted: 'contacted_at',
  confirmed: 'confirmed_at',
  completed: 'completed_at',
  archived: 'archived_at',
};

export async function updateBookingStatus(
  ids: string[],
  status: BookingStatus,
  opts: { note?: string; at?: string | null } = {},
): Promise<Result> {
  try {
    const { email } = await requireAdmin();
    if (!BOOKING_STATUSES.includes(status)) return { success: false, error: 'Invalid status' };
    if (!ids.length) return { success: true };
    const db = getAdminClient();
    const { data: current, error: readErr } = await db.from('bookings').select('id, status, preferred_at').in('id', ids);
    if (readErr) throw readErr;
    const now = new Date().toISOString();
    const update: Record<string, unknown> = { status, read: true };
    const stamp = STATUS_STAMP[status];
    if (stamp) update[stamp] = now;
    if (opts.at !== undefined && opts.at !== null) {
      const { settings } = await loadSettingsAndServices();
      const at = new Date(opts.at);
      if (!Number.isNaN(at.getTime())) {
        update.preferred_at = at.toISOString();
        update.preferred_date = dateKey(at, settings.timezone);
        update.preferred_time = timeKey(at, settings.timezone);
      }
    }
    const { error } = await db.from('bookings').update(update).in('id', ids);
    if (error) throw error;
    await Promise.all(
      (current || []).map((b) =>
        logEvent(b.id, {
          type: 'status',
          from_status: (b.status as string) || 'new',
          to_status: status,
          note: opts.note ?? (opts.at && opts.at !== b.preferred_at ? `time:${opts.at}` : null),
          actor: email,
        }),
      ),
    );
    return { success: true };
  } catch (err) {
    console.error('Error updating booking status:', err);
    return { success: false, error: errorMessage(err), schemaOutdated: isSchemaError(err) };
  }
}

// Fold duplicate submissions into one: the others are archived (never
// deleted) with a "merged" event pointing at the primary.
export async function mergeBookings(primaryId: string, otherIds: string[]): Promise<Result> {
  try {
    const { email } = await requireAdmin();
    const others = otherIds.filter((id) => id !== primaryId);
    if (!others.length) return { success: true };
    const db = getAdminClient();
    const { error } = await db
      .from('bookings')
      .update({ status: 'archived', archived_at: new Date().toISOString(), read: true })
      .in('id', others);
    if (error) throw error;
    await Promise.all(others.map((id) => logEvent(id, { type: 'merged', to_status: 'archived', note: primaryId, actor: email })));
    await logEvent(primaryId, { type: 'merged_in', note: others.join(','), actor: email });
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err), schemaOutdated: isSchemaError(err) };
  }
}

export async function setBookingsRead(ids: string[], read: boolean): Promise<Result> {
  try {
    await requireAdmin();
    if (!ids.length) return { success: true };
    const { error } = await getAdminClient().from('bookings').update({ read }).in('id', ids);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function saveBookingNotes(id: string, notes: string): Promise<Result> {
  try {
    await requireAdmin();
    const { error } = await getAdminClient().from('bookings').update({ notes: notes.slice(0, 4000) }).eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err), schemaOutdated: isSchemaError(err) };
  }
}

// Record that the owner reached out (opened SMS / email / call) with a
// template. Moves New → Contacted so the inbox reflects reality.
export async function logBookingContact(
  id: string,
  info: { channel: 'sms' | 'email' | 'call' | 'instagram'; kind: 'confirm' | 'suggest' | 'decline' | 'reminder' | 'review' | 'custom'; alternatives?: string[] },
): Promise<Result> {
  try {
    const { email } = await requireAdmin();
    const db = getAdminClient();
    const { data: cur } = await db.from('bookings').select('status, alt_times').eq('id', id).maybeSingle();
    const update: Record<string, unknown> = { read: true };
    const status = (cur?.status as BookingStatus) || 'new';
    if (status === 'new' && info.kind !== 'review') {
      update.status = 'contacted';
      update.contacted_at = new Date().toISOString();
    }
    if (info.alternatives?.length) update.alt_times = info.alternatives;
    const { error } = await db.from('bookings').update(update).eq('id', id);
    if (error) throw error;
    await logEvent(id, {
      type: 'contacted',
      from_status: status,
      to_status: (update.status as string) || status,
      note: `${info.channel}:${info.kind}${info.alternatives?.length ? ':' + info.alternatives.join(',') : ''}`,
      actor: email,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err), schemaOutdated: isSchemaError(err) };
  }
}

export async function rescheduleBooking(id: string, atIso: string): Promise<Result> {
  try {
    const { email } = await requireAdmin();
    const at = new Date(atIso);
    if (Number.isNaN(at.getTime())) return { success: false, error: 'Invalid time' };
    const { settings } = await loadSettingsAndServices();
    const { error } = await getAdminClient()
      .from('bookings')
      .update({ preferred_at: at.toISOString(), preferred_date: dateKey(at, settings.timezone), preferred_time: timeKey(at, settings.timezone) })
      .eq('id', id);
    if (error) throw error;
    await logEvent(id, { type: 'rescheduled', note: at.toISOString(), actor: email });
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err), schemaOutdated: isSchemaError(err) };
  }
}

// Soft delete → Trash (restorable for 30 days).
export async function trashBookings(ids: string[]): Promise<Result> {
  try {
    const { email } = await requireAdmin();
    if (!ids.length) return { success: true };
    const { error } = await getAdminClient().from('bookings').update({ deleted_at: new Date().toISOString() }).in('id', ids);
    if (error) throw error;
    await Promise.all(ids.map((id) => logEvent(id, { type: 'trashed', actor: email })));
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err), schemaOutdated: isSchemaError(err) };
  }
}

export async function restoreBookings(ids: string[]): Promise<Result> {
  try {
    const { email } = await requireAdmin();
    if (!ids.length) return { success: true };
    const { error } = await getAdminClient().from('bookings').update({ deleted_at: null }).in('id', ids);
    if (error) throw error;
    await Promise.all(ids.map((id) => logEvent(id, { type: 'restored', actor: email })));
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err), schemaOutdated: isSchemaError(err) };
  }
}

// Permanent delete. The UI always asks for confirmation first.
export async function purgeBookings(ids: string[]): Promise<Result> {
  try {
    await requireAdmin();
    if (!ids.length) return { success: true };
    const { error } = await getAdminClient().from('bookings').delete().in('id', ids);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

// Legacy names kept for any external callers.
export async function markBookingRead(id: string, read: boolean) {
  return setBookingsRead([id], read);
}
export async function deleteBooking(id: string) {
  return trashBookings([id]);
}
