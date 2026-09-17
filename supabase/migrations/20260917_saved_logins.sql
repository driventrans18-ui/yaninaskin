-- Saved logins for the owner (e.g. the Wix account that holds the domain).
-- Passwords are stored encrypted by the app server; only the service role
-- reads this column. Additive and idempotent.
alter table public.about_content
  add column if not exists saved_logins jsonb not null default '{}'::jsonb;

notify pgrst, 'reload schema';
