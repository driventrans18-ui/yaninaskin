-- ============================================================================
-- Hardening after the admin redesign is deployed. Run AFTER the app that
-- submits bookings through the server (service role) is live.
--
--   * Public (anon) inserts into bookings go through the server action now,
--     which validates, rate-limits and de-duplicates — the direct insert
--     policy is no longer needed and would bypass those checks.
--   * Reviewers' email addresses must never be readable with the public key:
--     the anon/authenticated roles keep SELECT on reviews, but only on the
--     columns the website shows.
--   * set_updated_at gets a fixed search_path (Supabase security advisor).
--
-- Every statement is idempotent.
-- ============================================================================

drop policy if exists "Public can create bookings" on public.bookings;

alter function public.set_updated_at() set search_path = public;

-- Column-level read access for the public roles on reviews (no email).
revoke select on table public.reviews from anon, authenticated;
grant select (id, name, rating, comment, approved, created_at, reply_text, reply_by, photo_url, photos, likes, hidden, service, deleted_at, updated_at)
  on table public.reviews to anon, authenticated;

notify pgrst, 'reload schema';
