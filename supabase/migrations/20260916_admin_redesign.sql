-- ============================================================================
-- Admin redesign: bookings pipeline, soft delete, business hours, services
-- metadata, review moderation fields. ADDITIVE ONLY — every statement is
-- idempotent (IF NOT EXISTS / OR REPLACE) and no existing column or row is
-- dropped or rewritten destructively. Safe to run more than once.
--
-- Run in Supabase → SQL Editor → New query → paste → Run.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Shared updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- BOOKINGS: contact details, status pipeline, timing, soft delete
-- ---------------------------------------------------------------------------
alter table public.bookings
  add column if not exists phone              text,
  add column if not exists phone_normalized   text,      -- E.164, e.g. +15855550123
  add column if not exists email              text,
  add column if not exists email_normalized   text,      -- lower-cased, trimmed
  add column if not exists status             text not null default 'new',
  add column if not exists lang               text not null default 'en',  -- site language used
  add column if not exists preferred_at       timestamptz,               -- preferred_date + preferred_time in studio tz
  add column if not exists duration_minutes   integer,
  add column if not exists alt_times          jsonb not null default '[]'::jsonb, -- ISO timestamps the client would also accept
  add column if not exists notes              text,                      -- private admin notes
  add column if not exists submission_key     text,                      -- idempotency hash of the submission
  add column if not exists submission_count   integer not null default 1,
  add column if not exists last_submitted_at  timestamptz,
  add column if not exists ip_hash            text,
  add column if not exists contacted_at       timestamptz,
  add column if not exists confirmed_at       timestamptz,
  add column if not exists completed_at       timestamptz,
  add column if not exists archived_at        timestamptz,
  add column if not exists deleted_at         timestamptz,
  add column if not exists updated_at         timestamptz not null default now();

alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('new','contacted','confirmed','completed','declined','cancelled','no_show','archived'));

-- Backfill preferred_at from the legacy text pair ("2026-09-29" + "10:00 AM" / "18:00").
-- Interpreted in the studio's timezone. Rows without a parseable time are left
-- with preferred_at at 09:00 local (so they sort by day) and keep preferred_time null.
update public.bookings
   set preferred_at = case
     when preferred_date ~ '^\d{4}-\d{2}-\d{2}$' and coalesce(preferred_time,'') ~* '^\s*\d{1,2}:\d{2}\s*(AM|PM)\s*$'
       then (preferred_date || ' ' || trim(preferred_time))::timestamp at time zone 'America/New_York'
     when preferred_date ~ '^\d{4}-\d{2}-\d{2}$' and coalesce(preferred_time,'') ~ '^\s*\d{1,2}:\d{2}\s*$'
       then (preferred_date || ' ' || trim(preferred_time))::timestamp at time zone 'America/New_York'
     when preferred_date ~ '^\d{4}-\d{2}-\d{2}$'
       then (preferred_date || ' 09:00')::timestamp at time zone 'America/New_York'
     else null
   end
 where preferred_at is null;

update public.bookings set last_submitted_at = created_at where last_submitted_at is null;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

create index if not exists bookings_status_idx           on public.bookings (status);
create index if not exists bookings_preferred_at_idx     on public.bookings (preferred_at);
create index if not exists bookings_phone_normalized_idx on public.bookings (phone_normalized);
create index if not exists bookings_email_normalized_idx on public.bookings (email_normalized);
create index if not exists bookings_deleted_at_idx       on public.bookings (deleted_at);
create index if not exists bookings_submission_key_idx   on public.bookings (submission_key, created_at desc);

-- Activity log: every status change / note / merge, with a timestamp.
create table if not exists public.booking_events (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references public.bookings(id) on delete cascade,
  type        text not null,          -- created | status | note | merged | trashed | restored | contacted | reminder
  from_status text,
  to_status   text,
  note        text,
  actor       text,                   -- admin email or 'client' / 'system'
  created_at  timestamptz not null default now()
);
create index if not exists booking_events_booking_id_idx on public.booking_events (booking_id, created_at);
alter table public.booking_events enable row level security;
-- No public policies: only the service role (server actions) reads/writes events.

-- Backfill a 'created' event for legacy rows so timelines are never empty.
insert into public.booking_events (booking_id, type, to_status, actor, created_at)
select b.id, 'created', 'new', 'client', b.created_at
  from public.bookings b
 where not exists (select 1 from public.booking_events e where e.booking_id = b.id and e.type = 'created');

-- Rate limiting for the public form (by hashed IP and by phone).
create table if not exists public.rate_limit_hits (
  id         bigserial primary key,
  bucket     text not null,
  created_at timestamptz not null default now()
);
create index if not exists rate_limit_hits_bucket_idx on public.rate_limit_hits (bucket, created_at desc);
alter table public.rate_limit_hits enable row level security;

-- ---------------------------------------------------------------------------
-- REVIEWS: moderation state, service, soft delete
-- ---------------------------------------------------------------------------
alter table public.reviews
  add column if not exists hidden     boolean not null default false,
  add column if not exists service    text,
  add column if not exists deleted_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at before update on public.reviews
  for each row execute function public.set_updated_at();
create index if not exists reviews_deleted_at_idx on public.reviews (deleted_at);

-- ---------------------------------------------------------------------------
-- CONTACT MESSAGES: status + soft delete
-- ---------------------------------------------------------------------------
alter table public.contact_submissions
  add column if not exists status      text not null default 'new',   -- new | replied | archived
  add column if not exists notes       text,
  add column if not exists archived_at timestamptz,
  add column if not exists deleted_at  timestamptz,
  add column if not exists updated_at  timestamptz not null default now();
create index if not exists contact_submissions_deleted_at_idx on public.contact_submissions (deleted_at);

-- ---------------------------------------------------------------------------
-- SERVICES: translations, duration/buffer, price range, flags, notes
-- ---------------------------------------------------------------------------
alter table public.services
  add column if not exists translations      jsonb,                         -- { uk: { treatment_title, treatment_description, treatment_note, category_title, category_description } }
  add column if not exists duration_minutes  integer,
  add column if not exists buffer_minutes    integer,
  add column if not exists price_min         numeric,
  add column if not exists price_max         numeric,
  add column if not exists active            boolean not null default true,
  add column if not exists bookable          boolean not null default true,
  add column if not exists brand_ids         jsonb not null default '[]'::jsonb,
  add column if not exists prep_notes        text,
  add column if not exists aftercare_notes   text,
  add column if not exists contraindications text,
  add column if not exists archived_at       timestamptz,
  add column if not exists deleted_at        timestamptz;

-- Backfill duration_minutes from the free-text duration ("1 hour", "1.5 hours", "80 min", "90").
update public.services
   set duration_minutes = case
     when treatment_duration ~* '^\s*\d+(\.\d+)?\s*(h|hr|hrs|hour|hours)\y'
       then round((substring(treatment_duration from '(\d+(?:\.\d+)?)'))::numeric * 60)::int
     when treatment_duration ~* '\d+\s*(m|min|mins|minute|minutes)\y'
       then (substring(treatment_duration from '(\d+)'))::int
     when treatment_duration ~ '^\s*\d+\s*$'
       then trim(treatment_duration)::int
     else null
   end
 where duration_minutes is null and treatment_duration is not null;

-- Backfill price_min / price_max from the display price ("$140-160", "$110–250", "From $90+", "$ 220").
update public.services
   set price_min = (regexp_match(treatment_price, '(\d+(?:\.\d+)?)'))[1]::numeric,
       price_max = coalesce((regexp_match(treatment_price, '(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)'))[2]::numeric,
                            (regexp_match(treatment_price, '(\d+(?:\.\d+)?)'))[1]::numeric)
 where price_min is null and treatment_price ~ '\d';

create index if not exists services_active_idx on public.services (active, archived_at);

-- ---------------------------------------------------------------------------
-- SETTINGS (about_content singleton): hours, closures, booking rules,
-- templates, notification prefs, bio structure, defaults.
-- ---------------------------------------------------------------------------
alter table public.about_content
  add column if not exists business_hours            jsonb,                              -- { "1": [{"start":"09:00","end":"13:00"},{"start":"14:00","end":"18:00"}], ... } keyed by JS weekday (0=Sun)
  add column if not exists blackout_dates            jsonb not null default '[]'::jsonb, -- [{ "from":"2026-12-24", "to":"2026-12-26", "label":"Holidays" }]
  add column if not exists blocked_times             jsonb not null default '[]'::jsonb, -- [{ "start":"2026-09-20T13:00:00Z", "end":"2026-09-20T15:00:00Z", "label":"Lunch" }]
  add column if not exists booking_min_notice_hours  integer not null default 24,
  add column if not exists booking_max_days_ahead    integer not null default 60,
  add column if not exists booking_slot_minutes      integer not null default 60,
  add column if not exists booking_buffer_minutes    integer not null default 15,
  add column if not exists auto_archive_days         integer not null default 30,
  add column if not exists trash_retention_days      integer not null default 30,
  add column if not exists timezone                  text not null default 'America/New_York',
  add column if not exists currency                  text not null default 'USD',
  add column if not exists admin_lang                text not null default 'en',
  add column if not exists reply_templates           jsonb not null default '{}'::jsonb, -- { en: { confirm, suggest, decline, reminder, review }, uk: {...} }
  add column if not exists notification_prefs        jsonb not null default '{}'::jsonb, -- { new_booking_email: true, new_review_email: true, new_message_email: true, daily_digest: false }
  add column if not exists contact_methods           jsonb not null default '["sms","instagram"]'::jsonb,
  add column if not exists social_links              jsonb not null default '{}'::jsonb, -- { facebook, whatsapp, telegram, ... }
  add column if not exists bio_fields                jsonb not null default '{}'::jsonb, -- { en: { headline, years_experience, certifications:[{title,image}], specialties:[] }, uk: {...} }
  add column if not exists bio_draft                 jsonb,                              -- autosaved draft of the whole bio (published on demand)
  add column if not exists bio_published_at          timestamptz,
  add column if not exists photo_scale               numeric not null default 1;

-- Backfill weekly hours from the legacy open-hours settings so the public
-- booking calendar keeps offering exactly what it offered before.
update public.about_content a
   set business_hours = (
     select jsonb_object_agg(
       d,
       jsonb_build_array(jsonb_build_object(
         'start', lpad(a.booking_start_hour::text, 2, '0') || ':00',
         'end',   lpad(a.booking_end_hour::text, 2, '0')   || ':00'))
     )
     from jsonb_array_elements_text(a.booking_open_days) d
   )
 where a.business_hours is null;

-- ---------------------------------------------------------------------------
-- TRASH PURGE: permanently removes soft-deleted rows older than the retention
-- window. Called by the app's scheduled purge route (service role only).
-- ---------------------------------------------------------------------------
create or replace function public.purge_trash(retention_days integer default 30)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer := 0;
  c integer;
  cutoff timestamptz := now() - make_interval(days => greatest(retention_days, 1));
begin
  delete from public.bookings where deleted_at is not null and deleted_at < cutoff;
  get diagnostics c = row_count; n := n + c;
  delete from public.reviews where deleted_at is not null and deleted_at < cutoff;
  get diagnostics c = row_count; n := n + c;
  delete from public.contact_submissions where deleted_at is not null and deleted_at < cutoff;
  get diagnostics c = row_count; n := n + c;
  delete from public.services where deleted_at is not null and deleted_at < cutoff;
  get diagnostics c = row_count; n := n + c;
  delete from public.rate_limit_hits where created_at < now() - interval '2 days';
  return n;
end $$;

revoke all on function public.purge_trash(integer) from public, anon, authenticated;
grant execute on function public.purge_trash(integer) to service_role;
