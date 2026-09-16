-- Run AFTER the admin redesign is deployed. The public booking form now
-- submits through a validated server action (rate limited, spam-checked),
-- so anonymous clients no longer need direct INSERT access to bookings.
-- Removing the policy stops anyone with the public anon key from inserting
-- arbitrary rows (e.g. pre-"confirmed" bookings) straight into the table.
drop policy if exists "Public can create bookings" on public.bookings;
