import type {
  BlackoutDate,
  BlockedTime,
  BookingSettings,
  BusinessHours,
  ContactMethod,
  ReplyTemplates,
  ServiceLite,
} from './types';
import { DEFAULT_TZ } from '../tz';

export const DEFAULT_SETTINGS: BookingSettings = {
  timezone: DEFAULT_TZ,
  businessHours: {
    '1': [{ start: '09:00', end: '18:00' }],
    '2': [{ start: '09:00', end: '18:00' }],
    '3': [{ start: '09:00', end: '18:00' }],
    '4': [{ start: '09:00', end: '18:00' }],
    '5': [{ start: '09:00', end: '18:00' }],
  },
  blackoutDates: [],
  blockedTimes: [],
  minNoticeHours: 24,
  maxDaysAhead: 60,
  slotMinutes: 60,
  bufferMinutes: 15,
  autoArchiveDays: 30,
  trashRetentionDays: 30,
  currency: 'USD',
  adminLang: 'en',
  contactMethods: ['sms', 'instagram'],
  replyTemplates: {},
  notificationPrefs: {},
  phone: '',
  email: '',
  address: '',
  instagramUrl: '',
  tiktokUrl: '',
  socialLinks: {},
  requireReviewApproval: false,
};

const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const str = (v: unknown, d = '') => (typeof v === 'string' ? v : d);
const parseJson = (v: unknown) => {
  if (typeof v === 'string') {
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  }
  return v;
};

// Weekly hours from the legacy booking_start_hour / booking_end_hour / open_days.
export function legacyHours(row: Record<string, unknown>): BusinessHours {
  const start = num(row.booking_start_hour, 9);
  const end = num(row.booking_end_hour, 18);
  const days = Array.isArray(row.booking_open_days) ? (row.booking_open_days as number[]) : [1, 2, 3, 4, 5];
  const pad = (n: number) => String(n).padStart(2, '0');
  const out: BusinessHours = {};
  for (const d of days) out[String(d)] = [{ start: `${pad(start)}:00`, end: `${pad(end)}:00` }];
  return out;
}

function cleanHours(v: unknown): BusinessHours | null {
  const raw = parseJson(v);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const out: BusinessHours = {};
  for (const [k, shifts] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^[0-6]$/.test(k) || !Array.isArray(shifts)) continue;
    const ok = (shifts as unknown[])
      .filter(
        (s): s is { start: string; end: string } =>
          !!s &&
          typeof s === 'object' &&
          /^\d{2}:\d{2}$/.test(String((s as { start?: unknown }).start)) &&
          /^\d{2}:\d{2}$/.test(String((s as { end?: unknown }).end)),
      )
      .map((s) => ({ start: s.start, end: s.end }));
    if (ok.length) out[k] = ok;
  }
  return out;
}

// Build a fully-defaulted settings object from the about_content row (which may
// pre-date the migration, in which case the legacy hour columns are used).
export function settingsFromRow(row: Record<string, unknown> | null | undefined): BookingSettings {
  if (!row) return DEFAULT_SETTINGS;
  const hours = cleanHours(row.business_hours) ?? legacyHours(row);
  const blackout = parseJson(row.blackout_dates);
  const blocked = parseJson(row.blocked_times);
  const methodsRaw = parseJson(row.contact_methods);
  const methods = (Array.isArray(methodsRaw) ? methodsRaw : DEFAULT_SETTINGS.contactMethods).filter(
    (m): m is ContactMethod => ['sms', 'instagram', 'email', 'call'].includes(String(m)),
  );
  const templates = parseJson(row.reply_templates);
  const prefs = parseJson(row.notification_prefs);
  const social = parseJson(row.social_links);
  return {
    timezone: str(row.timezone, DEFAULT_TZ) || DEFAULT_TZ,
    businessHours: hours,
    blackoutDates: Array.isArray(blackout)
      ? (blackout as BlackoutDate[]).filter((b) => b && /^\d{4}-\d{2}-\d{2}$/.test(String(b.from)))
      : [],
    blockedTimes: Array.isArray(blocked)
      ? (blocked as BlockedTime[]).filter((b) => b && typeof b.start === 'string' && typeof b.end === 'string')
      : [],
    minNoticeHours: num(row.booking_min_notice_hours, DEFAULT_SETTINGS.minNoticeHours),
    maxDaysAhead: num(row.booking_max_days_ahead, DEFAULT_SETTINGS.maxDaysAhead),
    slotMinutes: Math.max(15, num(row.booking_slot_minutes, DEFAULT_SETTINGS.slotMinutes)),
    bufferMinutes: num(row.booking_buffer_minutes, DEFAULT_SETTINGS.bufferMinutes),
    autoArchiveDays: num(row.auto_archive_days, DEFAULT_SETTINGS.autoArchiveDays),
    trashRetentionDays: num(row.trash_retention_days, DEFAULT_SETTINGS.trashRetentionDays),
    currency: str(row.currency, 'USD') || 'USD',
    adminLang: row.admin_lang === 'uk' ? 'uk' : 'en',
    contactMethods: methods.length ? methods : DEFAULT_SETTINGS.contactMethods,
    replyTemplates: (templates && typeof templates === 'object' ? templates : {}) as ReplyTemplates,
    notificationPrefs: prefs && typeof prefs === 'object' ? prefs : {},
    phone: str(row.phone),
    email: str(row.email),
    address: str(row.address),
    instagramUrl: str(row.instagram_url),
    tiktokUrl: str(row.tiktok_url),
    socialLinks: social && typeof social === 'object' ? social : {},
    requireReviewApproval: Boolean(row.require_review_approval),
  };
}

// Normalise a services row (legacy or migrated) into the small shape the
// booking logic needs.
export function serviceLiteFromRow(row: Record<string, unknown>): ServiceLite {
  return {
    id: Number(row.id),
    title: str(row.treatment_title),
    category: str(row.category_title),
    price: str(row.treatment_price),
    priceMin: typeof row.price_min === 'number' ? row.price_min : row.price_min ? Number(row.price_min) : null,
    priceMax: typeof row.price_max === 'number' ? row.price_max : row.price_max ? Number(row.price_max) : null,
    durationMinutes: typeof row.duration_minutes === 'number' ? row.duration_minutes : null,
    bufferMinutes: typeof row.buffer_minutes === 'number' ? row.buffer_minutes : null,
    bookable: row.bookable !== false,
    active: row.active !== false && !row.archived_at && !row.deleted_at,
  };
}
