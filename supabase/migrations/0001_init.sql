-- ─────────────────────────────────────────────────────────────
-- NiBiGo AI Planner — 0001_init
-- Enums + bảng cốt lõi + trigger. Khớp docs/DATA_SCHEMA.md.
-- Chạy trong Supabase SQL editor (hoặc supabase db push) theo thứ tự 0001 → 0002 → 0003.
-- ─────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;   -- gen_random_uuid()

-- ── Enums ────────────────────────────────────────────────────
do $$ begin
  create type user_role          as enum ('guest', 'admin');
exception when duplicate_object then null; end $$;
do $$ begin
  create type product_type       as enum ('hotel', 'activity', 'restaurant', 'transport', 'combo');
exception when duplicate_object then null; end $$;
do $$ begin
  create type availability_status as enum ('available', 'limited', 'sold_out');
exception when duplicate_object then null; end $$;
do $$ begin
  create type package_tier        as enum ('budget', 'balanced', 'premium');
exception when duplicate_object then null; end $$;
do $$ begin
  create type trip_status         as enum ('draft', 'generated', 'revised', 'submitted');
exception when duplicate_object then null; end $$;
do $$ begin
  create type booking_status      as enum ('new', 'contacted', 'confirmed', 'cancelled');
exception when duplicate_object then null; end $$;

-- ── Helper: auto cập nhật updated_at ─────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- ── profiles (mở rộng auth.users) ────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  phone       text,
  role        user_role not null default 'guest',
  created_at  timestamptz not null default now()
);

-- Tạo profile tự động khi có user mới ở auth.users
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'guest')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── destinations ─────────────────────────────────────────────
create table if not exists public.destinations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  region      text,
  image_url   text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── travel_products ──────────────────────────────────────────
create table if not exists public.travel_products (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  type                product_type not null,
  destination_id      uuid not null references public.destinations(id) on delete restrict,
  description         text,
  price               integer not null,
  price_unit          text not null default 'per_person',  -- per_person | per_group | per_night | per_trip
  duration_hours      numeric,
  tags                text[] not null default '{}',
  suitable_for        text[] not null default '{}',
  availability_status availability_status not null default 'available',
  quality_score       smallint not null default 3,
  image_url           text,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_products_dest  on public.travel_products (destination_id) where is_active;
create index if not exists idx_products_type  on public.travel_products (type);
create index if not exists idx_products_tags  on public.travel_products using gin (tags);
create index if not exists idx_products_avail on public.travel_products (availability_status);

drop trigger if exists trg_products_updated on public.travel_products;
create trigger trg_products_updated before update on public.travel_products
  for each row execute function public.set_updated_at();

-- ── trip_requests ────────────────────────────────────────────
create table if not exists public.trip_requests (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  destination_id     uuid not null references public.destinations(id) on delete restrict,
  num_days           smallint not null check (num_days between 1 and 14),
  num_nights         smallint not null default 0,
  start_date         date,
  num_people         smallint not null check (num_people between 1 and 30),
  budget             integer not null,
  travel_style       text,
  interests          text[] not null default '{}',
  group_composition  jsonb not null default '{}',
  special_requests   text,
  status             trip_status not null default 'draft',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_trip_user on public.trip_requests (user_id);

drop trigger if exists trg_trips_updated on public.trip_requests;
create trigger trg_trips_updated before update on public.trip_requests
  for each row execute function public.set_updated_at();

-- ── tour_packages ────────────────────────────────────────────
create table if not exists public.tour_packages (
  id                    uuid primary key default gen_random_uuid(),
  trip_request_id       uuid not null references public.trip_requests(id) on delete cascade,
  tier                  package_tier not null,
  name                  text not null,
  total_price           integer not null,
  fit_score             smallint not null,
  recommendation_reason text,
  itinerary             jsonb not null default '[]',
  cost_breakdown        jsonb not null default '{}',
  conditions            text[] not null default '{}',
  is_selected           boolean not null default false,
  revision_count        smallint not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (trip_request_id, tier)
);

create index if not exists idx_packages_trip on public.tour_packages (trip_request_id);

drop trigger if exists trg_packages_updated on public.tour_packages;
create trigger trg_packages_updated before update on public.tour_packages
  for each row execute function public.set_updated_at();

-- ── tour_package_items ───────────────────────────────────────
create table if not exists public.tour_package_items (
  id                uuid primary key default gen_random_uuid(),
  tour_package_id   uuid not null references public.tour_packages(id) on delete cascade,
  travel_product_id uuid not null references public.travel_products(id) on delete restrict,
  day_number        smallint,
  slot              text,
  quantity          integer not null default 1,
  unit_price        integer not null,
  line_total        integer not null,
  sort_order        smallint not null default 0,
  created_at        timestamptz not null default now()
);

create index if not exists idx_items_package on public.tour_package_items (tour_package_id);

-- ── booking_requests ─────────────────────────────────────────
create sequence if not exists public.booking_code_seq;

create or replace function public.next_booking_code()
returns text language sql as $$
  select 'NBG-' || to_char(now(), 'YYYY') || '-'
         || lpad(nextval('public.booking_code_seq')::text, 4, '0');
$$;

create table if not exists public.booking_requests (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  trip_request_id  uuid not null references public.trip_requests(id) on delete restrict,
  tour_package_id  uuid not null references public.tour_packages(id) on delete restrict,
  contact_name     text not null,
  contact_phone    text not null,
  contact_email    text,
  note_from_guest  text,
  total_price      integer not null,
  ai_sales_note    text,
  status           booking_status not null default 'new',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_bookings_user   on public.booking_requests (user_id);
create index if not exists idx_bookings_status on public.booking_requests (status);

drop trigger if exists trg_bookings_updated on public.booking_requests;
create trigger trg_bookings_updated before update on public.booking_requests
  for each row execute function public.set_updated_at();

-- ── booking_status_history ───────────────────────────────────
create table if not exists public.booking_status_history (
  id                 uuid primary key default gen_random_uuid(),
  booking_request_id uuid not null references public.booking_requests(id) on delete cascade,
  from_status        booking_status,
  to_status          booking_status not null,
  changed_by         uuid references public.profiles(id),
  note               text,
  created_at         timestamptz not null default now()
);

create index if not exists idx_history_booking on public.booking_status_history (booking_request_id);
