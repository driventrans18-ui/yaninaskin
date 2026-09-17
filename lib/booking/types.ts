// Shared booking domain types. Plain data only — safe to import from server
// actions and client components alike.

export type BookingStatus =
  | 'new'
  | 'contacted'
  | 'confirmed'
  | 'completed'
  | 'declined'
  | 'cancelled'
  | 'no_show'
  | 'archived';

export const BOOKING_STATUSES: BookingStatus[] = [
  'new',
  'contacted',
  'confirmed',
  'completed',
  'declined',
  'cancelled',
  'no_show',
  'archived',
];

export const NEEDS_ACTION_STATUSES: BookingStatus[] = ['new', 'contacted'];

export type BookingMethod = 'sms' | 'instagram' | 'email' | 'call';

export interface Booking {
  id: string;
  name: string;
  service: string | null;
  price: string | null;
  preferred_date: string | null; // YYYY-MM-DD
  preferred_time: string | null; // "HH:MM" (new) or legacy label "9:00 AM"
  details: string | null;
  method: string | null;
  read: boolean;
  created_at: string;
  // Added by the 2026-09 migration (all optional so un-migrated rows still load)
  phone?: string | null;
  phone_normalized?: string | null;
  email?: string | null;
  email_normalized?: string | null;
  status?: BookingStatus | null;
  lang?: string | null;
  preferred_at?: string | null;
  duration_minutes?: number | null;
  alt_times?: string[] | null;
  notes?: string | null;
  submission_count?: number | null;
  last_submitted_at?: string | null;
  contacted_at?: string | null;
  confirmed_at?: string | null;
  completed_at?: string | null;
  archived_at?: string | null;
  deleted_at?: string | null;
  updated_at?: string | null;
}

export interface BookingEvent {
  id: string;
  booking_id: string;
  type: string;
  from_status: string | null;
  to_status: string | null;
  note: string | null;
  actor: string | null;
  created_at: string;
}

export interface BusinessShift {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

// Keyed by JS weekday as a string: "0" (Sunday) … "6" (Saturday).
export type BusinessHours = Record<string, BusinessShift[]>;

export interface BlackoutDate {
  from: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD (inclusive); defaults to `from`
  label?: string;
}

export interface BlockedTime {
  id?: string;
  start: string; // ISO instant
  end: string; // ISO instant
  label?: string;
}

export type ContactMethod = 'sms' | 'instagram' | 'email' | 'call';

export type TemplateKey = 'confirm' | 'suggest' | 'decline' | 'reminder' | 'review' | 'quick';
export type ReplyTemplates = Partial<Record<'en' | 'uk', Partial<Record<TemplateKey, string>>>>;

export interface NotificationPrefs {
  new_booking_email?: boolean;
  new_review_email?: boolean;
  new_message_email?: boolean;
  email?: string; // where to send; falls back to the studio email
}

export interface BookingSettings {
  timezone: string;
  businessHours: BusinessHours;
  blackoutDates: BlackoutDate[];
  blockedTimes: BlockedTime[];
  minNoticeHours: number;
  maxDaysAhead: number;
  slotMinutes: number;
  bufferMinutes: number;
  autoArchiveDays: number;
  trashRetentionDays: number;
  currency: string;
  adminLang: 'en' | 'uk';
  contactMethods: ContactMethod[];
  replyTemplates: ReplyTemplates;
  notificationPrefs: NotificationPrefs;
  phone: string;
  email: string;
  address: string;
  instagramUrl: string;
  tiktokUrl: string;
  socialLinks: Record<string, string>;
  requireReviewApproval: boolean;
}

export interface ServiceLite {
  id: number;
  title: string;
  category: string;
  price: string;
  priceMin: number | null;
  priceMax: number | null;
  durationMinutes: number | null;
  bufferMinutes: number | null;
  bookable: boolean;
  active: boolean;
}
