-- Clients the owner adds by hand (people who never used the website form),
-- matched to booking requests by phone or email. Additive and idempotent.
create table if not exists public.clients (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  phone            text,
  phone_normalized text,
  email            text,
  email_normalized text,
  instagram        text,
  notes            text,
  tags             jsonb not null default '[]'::jsonb,
  birthday         date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);
create index if not exists clients_phone_normalized_idx on public.clients (phone_normalized);
create index if not exists clients_email_normalized_idx on public.clients (email_normalized);
create index if not exists clients_deleted_at_idx       on public.clients (deleted_at);
alter table public.clients enable row level security;
-- No public policies: only the service role (server actions) reads/writes clients.

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at before update on public.clients
  for each row execute function public.set_updated_at();

-- Trash purge now covers clients too.
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
  delete from public.clients where deleted_at is not null and deleted_at < cutoff;
  get diagnostics c = row_count; n := n + c;
  delete from public.rate_limit_hits where created_at < now() - interval '2 days';
  return n;
end $$;

revoke all on function public.purge_trash(integer) from public, anon, authenticated;
grant execute on function public.purge_trash(integer) to service_role;

notify pgrst, 'reload schema';
