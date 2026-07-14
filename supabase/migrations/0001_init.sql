-- Parqo — schema iniziale
-- Le ricerche funzionano senza login; i dati personali e i piani sincronizzati
-- richiedono autenticazione. RLS attiva su tutte le tabelle con dati utente.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enum
-- ---------------------------------------------------------------------------
do $$ begin
  create type data_confidence as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type vehicle_type as enum ('city_car', 'sedan', 'suv', 'van', 'electric');
exception when duplicate_object then null; end $$;

do $$ begin
  create type plan_status as enum ('scheduled', 'active', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type priority_type as enum ('cheapest', 'closest', 'balanced', 'stress_free');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 con auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text,
  needs_accessibility boolean default false,
  default_priority priority_type default 'balanced',
  max_walking_distance_meters integer,
  max_budget numeric(8, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- vehicles
-- ---------------------------------------------------------------------------
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type vehicle_type,
  height_cm integer,
  length_cm integer,
  created_at timestamptz not null default now()
);
create index if not exists vehicles_user_id_idx on public.vehicles (user_id);

-- ---------------------------------------------------------------------------
-- parkings (dati pubblici, lettura libera)
-- ---------------------------------------------------------------------------
create table if not exists public.parkings (
  id text primary key,
  name text not null,
  slug text not null,
  description text,
  address text not null,
  city text not null,
  city_query text,
  latitude double precision not null,
  longitude double precision not null,
  price_per_hour numeric(6, 2),
  daily_max_price numeric(6, 2),
  estimated_total_price numeric(8, 2) not null,
  currency text not null default 'EUR',
  walking_distance_meters integer not null,
  walking_duration_minutes integer not null,
  driving_duration_minutes integer not null,
  total_duration_minutes integer not null,
  is_covered boolean not null default false,
  is_bookable boolean not null default false,
  has_ev_charging boolean not null default false,
  is_accessible boolean not null default false,
  is_open_24_hours boolean not null default false,
  is_outside_ztl boolean not null default false,
  opening_time text,
  closing_time text,
  max_vehicle_height_cm integer,
  total_spaces integer,
  data_confidence data_confidence not null default 'medium',
  data_source text not null default 'demo',
  last_verified_at timestamptz,
  image_url text,
  external_url text,
  tags text[] not null default '{}',
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists parkings_city_query_idx on public.parkings (city_query);

-- ---------------------------------------------------------------------------
-- parking_sources (provenienza/aggiornamento del dato)
-- ---------------------------------------------------------------------------
create table if not exists public.parking_sources (
  id uuid primary key default gen_random_uuid(),
  parking_id text not null references public.parkings (id) on delete cascade,
  source text not null,
  url text,
  confidence data_confidence not null default 'medium',
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- favorite_parkings
-- ---------------------------------------------------------------------------
create table if not exists public.favorite_parkings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  parking_id text not null references public.parkings (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, parking_id)
);
create index if not exists favorite_parkings_user_id_idx on public.favorite_parkings (user_id);

-- ---------------------------------------------------------------------------
-- saved_searches
-- ---------------------------------------------------------------------------
create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text,
  preferences jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists saved_searches_user_id_idx on public.saved_searches (user_id);

-- ---------------------------------------------------------------------------
-- parking_plans
-- ---------------------------------------------------------------------------
create table if not exists public.parking_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  search_preferences jsonb not null,
  estimated_arrival_time text,
  note text,
  status plan_status not null default 'scheduled',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists parking_plans_user_id_idx on public.parking_plans (user_id);

-- ---------------------------------------------------------------------------
-- parking_plan_items (piano A / piano B come snapshot del parcheggio)
-- ---------------------------------------------------------------------------
create table if not exists public.parking_plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.parking_plans (id) on delete cascade,
  role text not null check (role in ('primary', 'backup')),
  parking jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists parking_plan_items_plan_id_idx on public.parking_plan_items (plan_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists parking_plans_set_updated_at on public.parking_plans;
create trigger parking_plans_set_updated_at before update on public.parking_plans
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.parkings enable row level security;
alter table public.parking_sources enable row level security;
alter table public.favorite_parkings enable row level security;
alter table public.saved_searches enable row level security;
alter table public.parking_plans enable row level security;
alter table public.parking_plan_items enable row level security;

-- Parkings & sources: lettura pubblica (le ricerche funzionano senza login).
drop policy if exists "parkings_read_all" on public.parkings;
create policy "parkings_read_all" on public.parkings for select using (true);

drop policy if exists "parking_sources_read_all" on public.parking_sources;
create policy "parking_sources_read_all" on public.parking_sources for select using (true);

-- profiles: ciascuno vede/gestisce solo il proprio profilo.
drop policy if exists "profiles_self" on public.profiles;
create policy "profiles_self" on public.profiles
  using (auth.uid() = id) with check (auth.uid() = id);

-- vehicles
drop policy if exists "vehicles_self" on public.vehicles;
create policy "vehicles_self" on public.vehicles
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- favorite_parkings
drop policy if exists "favorites_self" on public.favorite_parkings;
create policy "favorites_self" on public.favorite_parkings
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- saved_searches
drop policy if exists "saved_searches_self" on public.saved_searches;
create policy "saved_searches_self" on public.saved_searches
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- parking_plans
drop policy if exists "plans_self" on public.parking_plans;
create policy "plans_self" on public.parking_plans
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- parking_plan_items: accessibili solo tramite un piano di proprietà.
drop policy if exists "plan_items_self" on public.parking_plan_items;
create policy "plan_items_self" on public.parking_plan_items
  using (
    exists (
      select 1 from public.parking_plans p
      where p.id = plan_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.parking_plans p
      where p.id = plan_id and p.user_id = auth.uid()
    )
  );

-- Crea automaticamente un profilo alla registrazione.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
