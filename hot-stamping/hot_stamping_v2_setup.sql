-- Hot Stamping V2 Supabase setup
-- Execute in Supabase > SQL Editor > New query > Run.
-- Uses existing public."Hot_Stamping_calibrations" table and adds dynamic libraries.

create table if not exists public.hot_machines (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  temperature_max numeric,
  pressure_max numeric,
  dwell_time_max numeric,
  site text,
  created_at timestamptz default now()
);

create table if not exists public.hot_supports (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name_fr text,
  name_en text,
  name_pt text,
  family text,
  created_at timestamptz default now()
);

create table if not exists public.hot_foils (
  id uuid primary key default gen_random_uuid(),
  support_code text,
  foil_code text unique not null,
  supplier text,
  color text,
  label_fr text,
  label_en text,
  label_pt text,
  temperature_min numeric,
  temperature_rec numeric,
  temperature_max numeric,
  pressure_min numeric,
  pressure_rec numeric,
  pressure_max numeric,
  dwell_time_min numeric,
  dwell_time_rec numeric,
  dwell_time_max numeric,
  created_at timestamptz default now()
);

alter table public.hot_machines enable row level security;
alter table public.hot_supports enable row level security;
alter table public.hot_foils enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (select 1 from pg_policies where schemaname='public' and tablename='hot_machines' and policyname='hot_machines_read') THEN
    create policy hot_machines_read on public.hot_machines for select to anon using (true);
  END IF;
  IF NOT EXISTS (select 1 from pg_policies where schemaname='public' and tablename='hot_machines' and policyname='hot_machines_insert') THEN
    create policy hot_machines_insert on public.hot_machines for insert to anon with check (true);
  END IF;
  IF NOT EXISTS (select 1 from pg_policies where schemaname='public' and tablename='hot_supports' and policyname='hot_supports_read') THEN
    create policy hot_supports_read on public.hot_supports for select to anon using (true);
  END IF;
  IF NOT EXISTS (select 1 from pg_policies where schemaname='public' and tablename='hot_supports' and policyname='hot_supports_insert') THEN
    create policy hot_supports_insert on public.hot_supports for insert to anon with check (true);
  END IF;
  IF NOT EXISTS (select 1 from pg_policies where schemaname='public' and tablename='hot_foils' and policyname='hot_foils_read') THEN
    create policy hot_foils_read on public.hot_foils for select to anon using (true);
  END IF;
  IF NOT EXISTS (select 1 from pg_policies where schemaname='public' and tablename='hot_foils' and policyname='hot_foils_insert') THEN
    create policy hot_foils_insert on public.hot_foils for insert to anon with check (true);
  END IF;
END $$;

grant usage on schema public to anon, authenticated;
grant select, insert on table public.hot_machines to anon, authenticated;
grant select, insert on table public.hot_supports to anon, authenticated;
grant select, insert on table public.hot_foils to anon, authenticated;
grant select, insert on table public."Hot_Stamping_calibrations" to anon, authenticated;

notify pgrst, 'reload schema';

select table_name
from information_schema.tables
where table_schema='public'
  and table_name in ('Hot_Stamping_calibrations','hot_machines','hot_supports','hot_foils')
order by table_name;
