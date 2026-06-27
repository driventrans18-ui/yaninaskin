-- Admin-curated "featured" reviews for the "What Clients Say" rotator.
-- Stores an ordered list of ids the admin picked in Settings, where each id is
-- either "sample:N" (a built-in sample review) or "review:N" (a real approved
-- review). Empty (the default) means the rotator shows the built-in samples.

alter table public.about_content
  add column if not exists featured_reviews jsonb not null default '[]'::jsonb;
