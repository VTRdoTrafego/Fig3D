-- Enable extension for UUID generation (if not enabled).
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text,
  current_thumb_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  logo_path text,
  model_type text not null default 'button-v1',
  border_width numeric(6,3) not null default 0.080,
  border_color text not null default '#ffffff',
  base_color text not null default '#ef4444',
  material_type text not null default 'glossy',
  light_intensity numeric(6,3) not null default 1.100,
  light_color text not null default '#ffffff',
  rotation_speed numeric(6,3) not null default 0.700,
  background_color text not null default '#111827',
  gif_path text,
  thumbnail_path text,
  json_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.project_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  version_id uuid references public.project_versions(id) on delete set null,
  asset_type text not null check (asset_type in ('logo', 'thumb', 'gif', 'model')),
  path text not null,
  mime_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.render_exports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  version_id uuid references public.project_versions(id) on delete set null,
  gif_path text not null,
  thumbnail_path text not null,
  duration_ms integer not null check (duration_ms > 0),
  fps integer not null check (fps between 1 and 60),
  background_color text not null default '#111827',
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_user_id_updated_at on public.projects(user_id, updated_at desc);
create index if not exists idx_versions_project_id_created_at on public.project_versions(project_id, created_at desc);
create index if not exists idx_assets_project_id on public.project_assets(project_id);
create index if not exists idx_exports_project_id_created_at on public.render_exports(project_id, created_at desc);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
before update on public.projects
for each row execute function public.handle_updated_at();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_versions enable row level security;
alter table public.project_assets enable row level security;
alter table public.render_exports enable row level security;

drop policy if exists "profiles-own-select" on public.profiles;
create policy "profiles-own-select" on public.profiles
for select using (id = auth.uid());

drop policy if exists "profiles-own-upsert" on public.profiles;
create policy "profiles-own-upsert" on public.profiles
for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "projects-own-access" on public.projects;
create policy "projects-own-access" on public.projects
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "versions-by-project-owner" on public.project_versions;
create policy "versions-by-project-owner" on public.project_versions
for all
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_id and p.user_id = auth.uid()
  )
);

drop policy if exists "assets-by-project-owner" on public.project_assets;
create policy "assets-by-project-owner" on public.project_assets
for all
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_id and p.user_id = auth.uid()
  )
);

drop policy if exists "exports-by-project-owner" on public.render_exports;
create policy "exports-by-project-owner" on public.render_exports
for all
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_id and p.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values
  ('logos', 'logos', true),
  ('thumbs', 'thumbs', true),
  ('exports', 'exports', true)
on conflict (id) do nothing;

drop policy if exists "logos-owner-read-write" on storage.objects;
create policy "logos-owner-read-write" on storage.objects
for all
using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "thumbs-owner-read-write" on storage.objects;
create policy "thumbs-owner-read-write" on storage.objects
for all
using (bucket_id = 'thumbs' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'thumbs' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "exports-owner-read-write" on storage.objects;
create policy "exports-owner-read-write" on storage.objects
for all
using (bucket_id = 'exports' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'exports' and auth.uid()::text = (storage.foldername(name))[1]);
