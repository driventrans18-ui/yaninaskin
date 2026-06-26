-- Booking requests captured from the website's "Book" modal.
-- Each row is one booking attempt (the visitor also gets handed off to SMS or
-- Instagram to finish the conversation). Stored so the owner can see them —
-- including the selected service's price — in the admin Bookings tab.

create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  service text,                 -- selected treatment title, or "Something else"
  price text,                   -- price of the selected treatment, if any
  preferred_date text,          -- ISO date (YYYY-MM-DD) the visitor picked
  preferred_time text,          -- friendly time label, e.g. "9:00 AM"
  details text,                 -- free-text note from the visitor
  method text not null default 'sms',  -- 'sms' | 'instagram'
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists bookings_created_at_idx
  on public.bookings (created_at desc);

-- Visitors submit with the public anon key; reading/updating/deleting happens
-- server-side with the service-role key (which bypasses RLS).
alter table public.bookings enable row level security;

drop policy if exists "Public can create bookings" on public.bookings;
create policy "Public can create bookings"
  on public.bookings
  for insert
  to anon, authenticated
  with check (true);
