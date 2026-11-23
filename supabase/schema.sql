-- Aura Salon classroom demo database.
-- Run this in Supabase Dashboard → SQL Editor.
-- WARNING: this demo intentionally allows anonymous access to one shared JSON state row.
-- Use only sample names/numbers. For a real salon, add Auth + role-based RLS and normalized tables.

create table if not exists public.salon_state (
  id text primary key check (id = 'main'),
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.salon_state enable row level security;

drop policy if exists "Public demo can read salon state" on public.salon_state;
create policy "Public demo can read salon state"
  on public.salon_state for select
  to anon, authenticated
  using (id = 'main');

drop policy if exists "Public demo can create salon state" on public.salon_state;
create policy "Public demo can create salon state"
  on public.salon_state for insert
  to anon, authenticated
  with check (id = 'main');

drop policy if exists "Public demo can update salon state" on public.salon_state;
create policy "Public demo can update salon state"
  on public.salon_state for update
  to anon, authenticated
  using (id = 'main')
  with check (id = 'main');

grant select, insert, update on public.salon_state to anon, authenticated;

-- Enable realtime updates for the single shared state row.
do $$
begin
  alter publication supabase_realtime add table public.salon_state;
exception
  when duplicate_object then null;
  when undefined_object then
    raise notice 'Publication supabase_realtime was not found. Enable Realtime for salon_state in Database → Publications.';
end $$;

create or replace function public.set_salon_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists salon_state_updated_at on public.salon_state;
create trigger salon_state_updated_at
before update on public.salon_state
for each row execute function public.set_salon_state_updated_at();
