-- ─────────────────────────────────────────────────────────────
-- NiBiGo AI Travel Platform — 0004_expand_schema
-- Phase 8: mở rộng 2-role → 4-role + schema commerce/CMS.
-- Khớp docs/DATA_SCHEMA.md. Nối tiếp 0001–0003, KHÔNG sửa migration cũ.
--
-- ⚠️ Chạy file này TRƯỚC, commit xong, rồi mới chạy 0005_rls_roles.sql.
--    Lý do: Postgres không cho dùng enum value vừa ADD trong cùng transaction
--    (helper/policy ở 0005 tham chiếu 'sales'/'editor').
-- ─────────────────────────────────────────────────────────────

-- ── 1. Mở rộng enum role: guest → buyer, thêm sales/editor ────
-- RENAME giữ nguyên dữ liệu cũ (mọi row 'guest' thành 'buyer', default tự đổi theo).
-- ⚠️ ADD VALUE phải ở top-level (KHÔNG bọc trong DO/exception — Postgres cấm ADD VALUE
--    trong subtransaction; nếu bọc, lỗi bị nuốt và giá trị enum không được thêm).
do $$ begin
  if exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
             where t.typname = 'user_role' and e.enumlabel = 'guest') then
    alter type user_role rename value 'guest' to 'buyer';
  end if;
end $$;
alter type user_role add value if not exists 'sales';
alter type user_role add value if not exists 'editor';

-- ── 2. Mở rộng các enum sẵn có (additive) ────────────────────
alter type product_type        add value if not exists 'homestay';
alter type availability_status add value if not exists 'need_confirmation';
alter type booking_status      add value if not exists 'checking_availability';
alter type booking_status      add value if not exists 'waiting_payment';
alter type booking_status      add value if not exists 'completed';

-- ── 3. Enum mới ──────────────────────────────────────────────
do $$ begin
  create type content_status as enum ('draft', 'pending_review', 'published', 'archived', 'rejected');
exception when duplicate_object then null; end $$;
do $$ begin
  create type order_status as enum (
    'pending_confirmation', 'awaiting_payment', 'paid', 'processing',
    'confirmed', 'completed', 'cancelled', 'refund_requested', 'refunded'
  );
exception when duplicate_object then null; end $$;
do $$ begin
  create type payment_status as enum ('unpaid', 'pending', 'paid_demo', 'refunded');
exception when duplicate_object then null; end $$;

-- ── 4. handle_new_user: user mới mặc định 'buyer' ────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'buyer')
  on conflict (id) do nothing;
  return new;
end; $$;

-- ── 5. profiles: thêm avatar_url + updated_at ────────────────
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── 6. Rename travel_products → products + cột mới ───────────
do $$ begin
  if exists (select 1 from information_schema.tables
             where table_schema='public' and table_name='travel_products')
     and not exists (select 1 from information_schema.tables
             where table_schema='public' and table_name='products') then
    alter table public.travel_products rename to products;
  end if;
end $$;

alter table public.products add column if not exists status content_status not null default 'published';
alter table public.products add column if not exists created_by uuid references public.profiles(id);
alter table public.products add column if not exists slug text;
do $$ begin
  create unique index if not exists idx_products_slug on public.products (slug) where slug is not null;
end $$;
create index if not exists idx_products_status on public.products (status);

-- Rename cột FK trong tour_package_items: travel_product_id → product_id
do $$ begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='tour_package_items'
               and column_name='travel_product_id') then
    alter table public.tour_package_items rename column travel_product_id to product_id;
  end if;
end $$;

-- ── 7. Ảnh + vị trí Google Maps cho sản phẩm ─────────────────
create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  url         text not null,
  alt         text,
  sort_order  smallint not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists idx_product_images_product on public.product_images (product_id);

create table if not exists public.product_locations (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  lat         double precision not null,
  lng         double precision not null,
  address     text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_product_locations_product on public.product_locations (product_id);

-- ── 8. Articles (CMS / guide) ────────────────────────────────
create table if not exists public.articles (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  slug                text not null unique,
  excerpt             text,
  content             text not null,
  cover_image_url     text,
  category            text,
  tags                text[] not null default '{}',
  related_product_ids uuid[] not null default '{}',
  status              content_status not null default 'draft',
  author_id           uuid references public.profiles(id),
  published_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists idx_articles_status on public.articles (status);
drop trigger if exists trg_articles_updated on public.articles;
create trigger trg_articles_updated before update on public.articles
  for each row execute function public.set_updated_at();

-- ── 9. Cart / saved / recently viewed ────────────────────────
create table if not exists public.cart_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity   integer not null default 1 check (quantity > 0),
  added_at   timestamptz not null default now(),
  unique (user_id, product_id)
);
create index if not exists idx_cart_user on public.cart_items (user_id);

create table if not exists public.saved_products (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.recently_viewed_products (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  viewed_at  timestamptz not null default now()
);
create index if not exists idx_recent_user on public.recently_viewed_products (user_id);

-- ── 10. booking_requests: payment_status + assigned_sales ────
alter table public.booking_requests add column if not exists payment_status payment_status not null default 'unpaid';
alter table public.booking_requests add column if not exists assigned_sales_id uuid references public.profiles(id);

-- Rename booking_status_history → booking_status_logs (khớp docs)
do $$ begin
  if exists (select 1 from information_schema.tables
             where table_schema='public' and table_name='booking_status_history')
     and not exists (select 1 from information_schema.tables
             where table_schema='public' and table_name='booking_status_logs') then
    alter table public.booking_status_history rename to booking_status_logs;
  end if;
end $$;

-- ── 11. Orders (commerce) ────────────────────────────────────
create sequence if not exists public.order_code_seq;
create or replace function public.next_order_code()
returns text language sql as $$
  select 'NBO-' || to_char(now(), 'YYYY') || '-'
         || lpad(nextval('public.order_code_seq')::text, 4, '0');
$$;

create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique,
  user_id           uuid not null references public.profiles(id) on delete cascade,
  status            order_status not null default 'pending_confirmation',
  payment_status    payment_status not null default 'unpaid',
  total_price       integer not null,
  assigned_sales_id uuid references public.profiles(id),
  note_from_buyer   text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists idx_orders_user   on public.orders (user_id);
create index if not exists idx_orders_status on public.orders (status);
drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity   integer not null default 1,
  unit_price integer not null,
  line_total integer not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_order_items_order on public.order_items (order_id);

create table if not exists public.order_status_logs (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  from_status order_status,
  to_status   order_status not null,
  changed_by  uuid references public.profiles(id),
  note        text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_order_logs_order on public.order_status_logs (order_id);

create table if not exists public.payments (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  amount     integer not null,
  method     text not null default 'demo',
  status     text not null default 'pending',
  reference  text,
  paid_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_payments_order on public.payments (order_id);

-- ── 12. Sales notes (booking hoặc order) ─────────────────────
create table if not exists public.sales_notes (
  id         uuid primary key default gen_random_uuid(),
  booking_request_id uuid references public.booking_requests(id) on delete cascade,
  order_id   uuid references public.orders(id) on delete cascade,
  author_id  uuid not null references public.profiles(id),
  content    text not null,
  created_at timestamptz not null default now(),
  check (booking_request_id is not null or order_id is not null)
);

-- ── 13. Notification events + audit logs ─────────────────────
create table if not exists public.notification_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade,
  type       text not null,
  channel    text not null default 'in_app',
  payload    jsonb not null default '{}',
  sent_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_notif_user on public.notification_events (user_id);

create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id),
  action      text not null,
  entity_type text not null,
  entity_id   uuid not null,
  before      jsonb,
  after       jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists idx_audit_entity on public.audit_logs (entity_type, entity_id);
