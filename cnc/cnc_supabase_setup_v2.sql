-- CNC-App-V8-Full-Library-FR-EN-PT -> Supabase setup
-- À exécuter dans Supabase > SQL Editor > Run.

create table if not exists public."CNC_calibrations" (
  id uuid primary key default gen_random_uuid(),
  material text,
  tool text,
  machine text,
  operation text,
  spindle_rpm numeric,
  feed_rate numeric,
  pass_depth_min numeric,
  pass_depth_max numeric,
  lateral_engagement_min numeric,
  lateral_engagement_max numeric,
  tool_diameter numeric,
  flutes numeric,
  cutting_speed numeric,
  chip_load numeric,
  operator text,
  site text,
  comments text,
  created_at timestamptz not null default now()
);

-- Si la table existe déjà, ajoute les colonnes manquantes.
alter table public."CNC_calibrations" add column if not exists material text;
alter table public."CNC_calibrations" add column if not exists tool text;
alter table public."CNC_calibrations" add column if not exists machine text;
alter table public."CNC_calibrations" add column if not exists operation text;
alter table public."CNC_calibrations" add column if not exists spindle_rpm numeric;
alter table public."CNC_calibrations" add column if not exists feed_rate numeric;
alter table public."CNC_calibrations" add column if not exists pass_depth_min numeric;
alter table public."CNC_calibrations" add column if not exists pass_depth_max numeric;
alter table public."CNC_calibrations" add column if not exists lateral_engagement_min numeric;
alter table public."CNC_calibrations" add column if not exists lateral_engagement_max numeric;
alter table public."CNC_calibrations" add column if not exists tool_diameter numeric;
alter table public."CNC_calibrations" add column if not exists flutes numeric;
alter table public."CNC_calibrations" add column if not exists cutting_speed numeric;
alter table public."CNC_calibrations" add column if not exists chip_load numeric;
alter table public."CNC_calibrations" add column if not exists operator text;
alter table public."CNC_calibrations" add column if not exists site text;
alter table public."CNC_calibrations" add column if not exists comments text;
alter table public."CNC_calibrations" add column if not exists created_at timestamptz default now();

alter table public."CNC_calibrations" enable row level security;

drop policy if exists "CNC public read" on public."CNC_calibrations";
create policy "CNC public read"
on public."CNC_calibrations"
for select
to anon
using (true);

drop policy if exists "CNC public insert" on public."CNC_calibrations";
create policy "CNC public insert"
on public."CNC_calibrations"
for insert
to anon
with check (true);
