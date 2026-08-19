-- Patch compatible base existante Samuel / Manufacturing Tools Hub
-- Ne recrée PAS les bibliothèques existantes. Ajoute seulement rôles, historique, colonnes de traçabilité et RLS/policies.
create table if not exists public.user_roles(
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  email text unique not null,
  role text not null default 'user',
  created_at timestamptz default now()
);
create table if not exists public.library_history(
  id uuid primary key default gen_random_uuid(),
  application text,
  table_name text,
  record_id text,
  action text,
  field_name text,
  old_value text,
  new_value text,
  user_id uuid,
  user_email text,
  created_at timestamptz default now()
);
-- Colonnes de traçabilité, ajoutées uniquement si elles n'existent pas.
alter table public.cnc_materials add column if not exists created_by_user_id uuid, add column if not exists created_by_email text, add column if not exists updated_by_user_id uuid, add column if not exists updated_by_email text, add column if not exists updated_at timestamptz;
alter table public.cnc_tools add column if not exists created_by_user_id uuid, add column if not exists created_by_email text, add column if not exists updated_by_user_id uuid, add column if not exists updated_by_email text, add column if not exists updated_at timestamptz;
alter table public.hot_supports add column if not exists created_by_user_id uuid, add column if not exists created_by_email text, add column if not exists updated_by_user_id uuid, add column if not exists updated_by_email text, add column if not exists updated_at timestamptz;
alter table public.hot_foils add column if not exists created_by_user_id uuid, add column if not exists created_by_email text, add column if not exists updated_by_user_id uuid, add column if not exists updated_by_email text, add column if not exists updated_at timestamptz;
alter table public.laser_materials add column if not exists created_by_user_id uuid, add column if not exists created_by_email text, add column if not exists updated_by_user_id uuid, add column if not exists updated_by_email text, add column if not exists updated_at timestamptz;
alter table public.laser_parameters add column if not exists created_by_user_id uuid, add column if not exists created_by_email text, add column if not exists updated_by_user_id uuid, add column if not exists updated_by_email text, add column if not exists updated_at timestamptz;
alter table public.cnc_calibrations add column if not exists created_by_user_id uuid, add column if not exists created_by_email text;
alter table public."Hot_Stamping_calibrations" add column if not exists created_by_user_id uuid, add column if not exists created_by_email text;
alter table public."Laser_calibrations" add column if not exists created_by_user_id uuid, add column if not exists created_by_email text;
-- RLS/policies simples pour app authentifiée.
alter table public.user_roles enable row level security;
alter table public.library_history enable row level security;
alter table public.cnc_materials enable row level security;
alter table public.cnc_tools enable row level security;
alter table public.cnc_machines enable row level security;
alter table public.cnc_calibrations enable row level security;
alter table public.hot_supports enable row level security;
alter table public.hot_foils enable row level security;
alter table public.hot_machines enable row level security;
alter table public."Hot_Stamping_calibrations" enable row level security;
alter table public.laser_materials enable row level security;
alter table public.laser_parameters enable row level security;
alter table public.laser_machines enable row level security;
alter table public."Laser_calibrations" enable row level security;
DO $$ DECLARE t text; BEGIN
FOREACH t IN ARRAY ARRAY['user_roles','library_history','cnc_materials','cnc_tools','cnc_machines','cnc_calibrations','hot_supports','hot_foils','hot_machines','Hot_Stamping_calibrations','laser_materials','laser_parameters','laser_machines','Laser_calibrations'] LOOP
  EXECUTE format('drop policy if exists read_all on public.%I', t);
  EXECUTE format('create policy read_all on public.%I for select to authenticated using (true)', t);
END LOOP;
END $$;
drop policy if exists user_role_insert_self on public.user_roles;
create policy user_role_insert_self on public.user_roles for insert to authenticated with check (user_id = auth.uid() and role = 'user');
drop policy if exists user_role_update_auth on public.user_roles;
create policy user_role_update_auth on public.user_roles for update to authenticated using (true) with check (true);
drop policy if exists history_insert on public.library_history;
create policy history_insert on public.library_history for insert to authenticated with check (true);
DO $$ DECLARE t text; BEGIN
FOREACH t IN ARRAY ARRAY['cnc_materials','cnc_tools','cnc_machines','cnc_calibrations','hot_supports','hot_foils','hot_machines','Hot_Stamping_calibrations','laser_materials','laser_parameters','laser_machines','Laser_calibrations'] LOOP
  EXECUTE format('drop policy if exists write_auth on public.%I', t);
  EXECUTE format('create policy write_auth on public.%I for all to authenticated using (true) with check (true)', t);
END LOOP;
END $$;
grant usage on schema public to anon, authenticated;
grant select,insert,update,delete on table public.user_roles, public.library_history, public.cnc_materials, public.cnc_tools, public.cnc_machines, public.cnc_calibrations, public.hot_supports, public.hot_foils, public.hot_machines, public."Hot_Stamping_calibrations", public.laser_materials, public.laser_parameters, public.laser_machines, public."Laser_calibrations" to authenticated;
notify pgrst, 'reload schema';
