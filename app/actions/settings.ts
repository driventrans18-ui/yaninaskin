'use server';

import { requireAdmin } from '@/lib/requireAdmin';
import { getAdminClient, getAnonClient } from '@/lib/supabaseAdmin';
import { isSchemaError, errorMessage } from '@/lib/dbErrors';
import { settingsFromRow, serviceLiteFromRow } from '@/lib/booking/settings';
import type { BookingSettings, ServiceLite, BusinessHours, BlackoutDate, BlockedTime, ReplyTemplates, NotificationPrefs, ContactMethod } from '@/lib/booking/types';

// The about_content singleton row id (created on first save if missing).
async function singletonId(): Promise<number | null> {
  const { data } = await getAdminClient().from('about_content').select('id').limit(1).maybeSingle();
  return data?.id ?? null;
}

export async function getBookingSettings(): Promise<{
  success: boolean;
  data: BookingSettings;
  services: ServiceLite[];
  schemaOutdated: boolean;
  error?: string;
}> {
  try {
    await requireAdmin();
    const db = getAdminClient();
    const [about, services] = await Promise.all([
      db.from('about_content').select('*').limit(1).maybeSingle(),
      db.from('services').select('*').order('category_order').order('treatment_order'),
    ]);
    if (about.error) throw about.error;
    if (services.error) throw services.error;
    const row = (about.data as Record<string, unknown> | null) ?? null;
    return {
      success: true,
      data: settingsFromRow(row),
      services: (services.data || []).map((s) => serviceLiteFromRow(s as Record<string, unknown>)),
      schemaOutdated: Boolean(row) && !('business_hours' in (row as object)),
    };
  } catch (err) {
    console.error('getBookingSettings:', err);
    return { success: false, data: settingsFromRow(null), services: [], schemaOutdated: isSchemaError(err), error: errorMessage(err) };
  }
}

export interface SettingsPatch {
  business_hours?: BusinessHours;
  blackout_dates?: BlackoutDate[];
  blocked_times?: BlockedTime[];
  booking_min_notice_hours?: number;
  booking_max_days_ahead?: number;
  booking_slot_minutes?: number;
  booking_buffer_minutes?: number;
  auto_archive_days?: number;
  trash_retention_days?: number;
  timezone?: string;
  currency?: string;
  admin_lang?: 'en' | 'uk';
  reply_templates?: ReplyTemplates;
  notification_prefs?: NotificationPrefs;
  contact_methods?: ContactMethod[];
  social_links?: Record<string, string>;
  phone?: string;
  email?: string;
  address?: string;
  instagram_url?: string;
  tiktok_url?: string;
  require_review_approval?: boolean;
  // Legacy columns kept in sync so older code paths keep working.
  booking_start_hour?: number;
  booking_end_hour?: number;
  booking_open_days?: number[];
}

const ALLOWED_KEYS: (keyof SettingsPatch)[] = [
  'business_hours', 'blackout_dates', 'blocked_times', 'booking_min_notice_hours', 'booking_max_days_ahead',
  'booking_slot_minutes', 'booking_buffer_minutes', 'auto_archive_days', 'trash_retention_days', 'timezone',
  'currency', 'admin_lang', 'reply_templates', 'notification_prefs', 'contact_methods', 'social_links', 'phone',
  'email', 'address', 'instagram_url', 'tiktok_url', 'require_review_approval', 'booking_start_hour',
  'booking_end_hour', 'booking_open_days',
];

export async function saveBookingSettings(patch: SettingsPatch): Promise<{ success: boolean; error?: string; schemaOutdated?: boolean }> {
  try {
    await requireAdmin();
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const k of ALLOWED_KEYS) if (k in patch) update[k] = patch[k];
    // Keep the legacy hour columns roughly in sync with the weekly hours so the
    // old public-site code (until redeployed) still offers sensible slots.
    if (patch.business_hours) {
      const days = Object.keys(patch.business_hours).map(Number).sort();
      const starts = Object.values(patch.business_hours).flat().map((s) => Number(s.start.slice(0, 2)));
      const ends = Object.values(patch.business_hours).flat().map((s) => Number(s.end.slice(0, 2)));
      if (days.length) {
        update.booking_open_days = days;
        update.booking_start_hour = Math.min(...starts);
        update.booking_end_hour = Math.max(...ends);
      }
    }
    const db = getAdminClient();
    const id = await singletonId();
    const q = id
      ? db.from('about_content').update(update).eq('id', id)
      : db.from('about_content').insert([update]);
    const { error } = await q;
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('saveBookingSettings:', err);
    return { success: false, error: errorMessage(err), schemaOutdated: isSchemaError(err) };
  }
}

// What the public booking form needs — and nothing else. No client data, no
// templates, no notification settings.
export interface PublicBookingConfig {
  timezone: string;
  businessHours: BusinessHours;
  blackoutDates: { from: string; to?: string }[];
  minNoticeHours: number;
  maxDaysAhead: number;
  slotMinutes: number;
  bufferMinutes: number;
  contactMethods: ContactMethod[];
  phone: string;
  instagramUrl: string;
  email: string;
  services: { title: string; category: string; price: string; durationMinutes: number | null }[];
  // Busy windows (start/end ISO) so the form only offers free slots. Client
  // identities are never included.
  busy: { start: string; end: string }[];
}

export async function getPublicBookingConfig(): Promise<PublicBookingConfig> {
  const db = getAdminClient();
  const anon = getAnonClient();
  const [about, services] = await Promise.all([
    anon.from('about_content').select('*').limit(1).maybeSingle(),
    anon.from('services').select('*').order('category_order').order('treatment_order'),
  ]);
  const s = settingsFromRow((about.data as Record<string, unknown> | null) ?? null);
  const lite = (services.data || []).map((r) => serviceLiteFromRow(r as Record<string, unknown>));
  const busy: { start: string; end: string }[] = [];
  try {
    // Confirmed appointments only (pending requests shouldn't block other clients).
    const since = new Date(Date.now() - 24 * 3600000).toISOString();
    const { data } = await db
      .from('bookings')
      .select('preferred_at, duration_minutes, preferred_time')
      .eq('status', 'confirmed')
      .is('deleted_at', null)
      .gte('preferred_at', since)
      .limit(500);
    for (const b of data || []) {
      if (!b.preferred_at || !b.preferred_time) continue;
      const start = new Date(b.preferred_at);
      const mins = typeof b.duration_minutes === 'number' && b.duration_minutes > 0 ? b.duration_minutes : s.slotMinutes;
      busy.push({ start: start.toISOString(), end: new Date(start.getTime() + mins * 60000).toISOString() });
    }
  } catch {
    /* un-migrated DB: no busy windows */
  }
  for (const t of s.blockedTimes) busy.push({ start: t.start, end: t.end });
  return {
    timezone: s.timezone,
    businessHours: s.businessHours,
    blackoutDates: s.blackoutDates.map((b) => ({ from: b.from, to: b.to })),
    minNoticeHours: s.minNoticeHours,
    maxDaysAhead: s.maxDaysAhead,
    slotMinutes: s.slotMinutes,
    bufferMinutes: s.bufferMinutes,
    contactMethods: s.contactMethods,
    phone: s.phone,
    instagramUrl: s.instagramUrl,
    email: s.email,
    services: lite
      .filter((x) => x.active && x.bookable)
      .map((x) => ({ title: x.title, category: x.category, price: x.price, durationMinutes: x.durationMinutes })),
    busy,
  };
}
