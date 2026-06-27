-- Settings tab: owner-editable options stored on the about_content singleton.
-- Defaults preserve the previous hardcoded behaviour exactly — booking hours
-- 9 AM-6 PM, open Mon-Fri, and reviews auto-published.

alter table public.about_content
  add column if not exists booking_start_hour      integer not null default 9,
  add column if not exists booking_end_hour        integer not null default 18,
  add column if not exists booking_open_days       jsonb   not null default '[1,2,3,4,5]'::jsonb,
  add column if not exists require_review_approval boolean not null default false;
