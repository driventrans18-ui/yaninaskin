-- Stores appointment requests submitted through the site's "Book Now" modal so
-- they show up in the admin (/admin/bookings), in addition to the existing
-- SMS / Instagram hand-off. Mirrors the contact_submissions table.
-- Run this once against the yaninaskin Supabase project
-- (SQL editor → New query → paste → Run).

CREATE TABLE IF NOT EXISTS public.booking_requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL DEFAULT '',
  service        TEXT NOT NULL DEFAULT '',
  preferred_when TEXT NOT NULL DEFAULT '',
  details        TEXT NOT NULL DEFAULT '',
  method         TEXT NOT NULL DEFAULT '',
  read           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Newest-first listing in the admin inbox.
CREATE INDEX IF NOT EXISTS booking_requests_created_at_idx
  ON public.booking_requests (created_at DESC);

-- Row Level Security: anonymous visitors may INSERT a request (the public form
-- uses the anon key); reads, updates and deletes happen through the service
-- role in the admin, which bypasses RLS. This matches contact_submissions.
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a booking request" ON public.booking_requests;
CREATE POLICY "Anyone can submit a booking request"
  ON public.booking_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
