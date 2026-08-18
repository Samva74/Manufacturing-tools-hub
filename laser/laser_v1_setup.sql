-- Laser Calculator V1 Supabase setup
-- À exécuter dans Supabase > SQL Editor > New query > Run.
create table if not exists public.laser_machines (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  watt numeric,
  speed_max numeric,
  lens text,
  site text,
  created_at timestamptz default now()
);
create table if not exists public.laser_materials (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name_fr text,
  name_en text,
  name_pt text,
  family text,
  note text,
  sensitive boolean default false,
  forbidden boolean default false,
  created_at timestamptz default now()
);
create table if not exists public.laser_parameters (
  id uuid primary key default gen_random_uuid(),
  material_code text,
  operation text,
  power_percent numeric,
  speed_mm_s numeric,
  passes numeric,
  frequency numeric,
  z_offset numeric,
  air_assist text,
  quality text,
  created_at timestamptz default now()
);
create table if not exists public."Laser_calibrations" (
  id uuid primary key default gen_random_uuid(),
  material text,
  operation text,
  machine text,
  thickness_mm numeric,
  power_percent numeric,
  speed_mm_s numeric,
  passes numeric,
  frequency numeric,
  z_offset numeric,
  air_assist text,
  operator text,
  site text,
  comments text,
  created_at timestamptz default now()
);
alter table public.laser_machines enable row level security;
alter table public.laser_materials enable row level security;
alter table public.laser_parameters enable row level security;
alter table public."Laser_calibrations" enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (select 1 from pg_policies where schemaname='public' and tablename='laser_machines' and policyname='laser_machines_read') THEN create policy laser_machines_read on public.laser_machines for select to anon using (true); END IF;
  IF NOT EXISTS (select 1 from pg_policies where schemaname='public' and tablename='laser_machines' and policyname='laser_machines_insert') THEN create policy laser_machines_insert on public.laser_machines for insert to anon with check (true); END IF;
  IF NOT EXISTS (select 1 from pg_policies where schemaname='public' and tablename='laser_materials' and policyname='laser_materials_read') THEN create policy laser_materials_read on public.laser_materials for select to anon using (true); END IF;
  IF NOT EXISTS (select 1 from pg_policies where schemaname='public' and tablename='laser_materials' and policyname='laser_materials_insert') THEN create policy laser_materials_insert on public.laser_materials for insert to anon with check (true); END IF;
  IF NOT EXISTS (select 1 from pg_policies where schemaname='public' and tablename='laser_parameters' and policyname='laser_parameters_read') THEN create policy laser_parameters_read on public.laser_parameters for select to anon using (true); END IF;
  IF NOT EXISTS (select 1 from pg_policies where schemaname='public' and tablename='laser_parameters' and policyname='laser_parameters_insert') THEN create policy laser_parameters_insert on public.laser_parameters for insert to anon with check (true); END IF;
  IF NOT EXISTS (select 1 from pg_policies where schemaname='public' and tablename='Laser_calibrations' and policyname='Laser_calibrations_read') THEN create policy "Laser_calibrations_read" on public."Laser_calibrations" for select to anon using (true); END IF;
  IF NOT EXISTS (select 1 from pg_policies where schemaname='public' and tablename='Laser_calibrations' and policyname='Laser_calibrations_insert') THEN create policy "Laser_calibrations_insert" on public."Laser_calibrations" for insert to anon with check (true); END IF;
END $$;
grant usage on schema public to anon, authenticated;
grant select, insert on table public.laser_machines to anon, authenticated;
grant select, insert on table public.laser_materials to anon, authenticated;
grant select, insert on table public.laser_parameters to anon, authenticated;
grant select, insert on table public."Laser_calibrations" to anon, authenticated;
notify pgrst, 'reload schema';
select table_name from information_schema.tables where table_schema='public' and table_name in ('laser_machines','laser_materials','laser_parameters','Laser_calibrations') order by table_name;
