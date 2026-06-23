# Data Schema — NiBiGo AI Travel Platform

Schema database (Supabase / Postgres), enum, RLS, function, và seed data cho mô hình
**4 role + full commerce** (Buyer/Sales/Editor-MOD/Admin). Tất cả định danh dùng tiếng Anh,
`snake_case`.

> ⚙️ **Ghi chú di chuyển từ MVP-Core (đã build):** codebase hiện tại dùng bảng
> `travel_products` (2-role, không có cart/order/article/Maps). Schema dưới đây là **đích mở
> rộng**. Khi migrate: `ALTER TABLE travel_products RENAME TO products;` rồi thêm các cột/enum
> mới (xem §8 Migration path) — **không sửa lại migration cũ**, chỉ thêm migration mới nối tiếp.
> Mã booking giữ format đã implement **`NBG-YYYY-NNNN`** (4 số) qua `next_booking_code()`,
> không đổi sang 6 số.

---

## 1. Enum types

```sql
create type user_role as enum ('buyer', 'sales', 'editor', 'admin');

-- 'activity' là bucket chung cho tour/trải nghiệm (engine MVP phụ thuộc giá trị này);
-- 'homestay' được gộp vào nhóm lưu trú 'hotel' ở engine (lib/tour-engine/filter.ts groupKey).
create type product_type as enum ('hotel', 'homestay', 'activity', 'restaurant', 'transport', 'combo');

create type price_unit as enum ('per_person', 'per_night', 'per_vehicle', 'per_package', 'per_booking');

create type availability_status as enum ('available', 'limited', 'sold_out', 'need_confirmation');

create type content_status as enum ('draft', 'pending_review', 'published', 'archived', 'rejected');

create type trip_request_status as enum ('draft', 'generated', 'revised', 'submitted');

create type booking_status as enum (
  'new', 'contacted', 'checking_availability', 'waiting_payment',
  'confirmed', 'completed', 'cancelled'
);

create type order_status as enum (
  'pending_confirmation', 'awaiting_payment', 'paid', 'processing',
  'confirmed', 'completed', 'cancelled', 'refund_requested', 'refunded'
);

create type payment_status as enum ('unpaid', 'pending', 'paid_demo', 'refunded');
```

> `booking_status`/`order_status` lưu chữ thường trong DB; UI/diagram hiển thị HOA cho rõ
> (vd `NEW` ↔ `'new'`) — không tạo khác biệt schema.

## 2. Bảng cốt lõi: user & destination

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role user_role not null default 'buyer',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  region text,
  description text,
  created_at timestamptz not null default now()
);
```

## 3. Sản phẩm & nội dung (Editor/MOD)

```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  type product_type not null,
  name text not null,
  slug text not null unique,
  destination_id uuid references destinations(id),
  description text,
  price numeric(12,0) not null,
  price_unit price_unit not null,
  currency text not null default 'VND',
  tags text[] default '{}',
  suitable_for text[] default '{}',          -- vd: family, couple, group, budget
  availability_status availability_status not null default 'available',
  status content_status not null default 'draft',
  is_active boolean not null default true,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt text,
  sort_order int not null default 0
);

create table product_locations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  address text
);

create table articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  category text,
  tags text[] default '{}',
  related_product_ids uuid[] default '{}',
  status content_status not null default 'draft',
  author_id uuid references profiles(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## 4. Trip request & AI planning (Buyer + NiBi AI)

```sql
create table trip_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  destination_id uuid references destinations(id),
  num_days int not null,
  start_date date,
  num_people int not null,
  group_composition text,                     -- vd "2 người lớn, 1 trẻ em"
  budget numeric(12,0),
  travel_style text,
  interests text[] default '{}',
  special_requests text,
  status trip_request_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ai_sessions (
  id uuid primary key default gen_random_uuid(),
  trip_request_id uuid not null references trip_requests(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table ai_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references ai_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table tour_packages (
  id uuid primary key default gen_random_uuid(),
  trip_request_id uuid not null references trip_requests(id) on delete cascade,
  name text not null,
  summary text,
  total_price numeric(12,0) not null,
  fit_score numeric(5,2),
  reasoning text,
  created_at timestamptz not null default now()
);

create table tour_package_items (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references tour_packages(id) on delete cascade,
  product_id uuid not null references products(id),
  day_number int,
  time_slot text,                              -- morning/afternoon/evening
  quantity int not null default 1,
  unit_price numeric(12,0) not null,
  line_total numeric(12,0) not null
);

create table recommendation_versions (
  id uuid primary key default gen_random_uuid(),
  trip_request_id uuid not null references trip_requests(id) on delete cascade,
  version_number int not null,
  package_snapshot jsonb not null,             -- snapshot gói + giá tại thời điểm revise
  created_at timestamptz not null default now()
);
```

## 5. Cart, saved & recently viewed

```sql
create table cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity int not null default 1,
  added_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table saved_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table recently_viewed_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id),
  viewed_at timestamptz not null default now()
);
```

## 6. Booking request (Sales) & Order (commerce)

```sql
create table booking_requests (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                   -- NBG-YYYY-NNNN, qua next_booking_code()
  user_id uuid not null references profiles(id),
  package_id uuid references tour_packages(id),
  status booking_status not null default 'new',
  payment_status payment_status not null default 'unpaid',
  total_price numeric(12,0) not null,
  ai_sales_note text,
  assigned_sales_id uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references booking_requests(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity int not null default 1,
  unit_price numeric(12,0) not null,
  line_total numeric(12,0) not null
);

create table booking_status_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references booking_requests(id) on delete cascade,
  from_status booking_status,
  to_status booking_status not null,
  changed_by uuid references profiles(id),
  note text,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                    -- NBO-YYYY-NNNN, qua next_order_code()
  user_id uuid not null references profiles(id),
  status order_status not null default 'pending_confirmation',
  payment_status payment_status not null default 'unpaid',
  total_price numeric(12,0) not null,
  assigned_sales_id uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity int not null default 1,
  unit_price numeric(12,0) not null,
  line_total numeric(12,0) not null
);

create table order_status_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  from_status order_status,
  to_status order_status not null,
  changed_by uuid references profiles(id),
  note text,
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  amount numeric(12,0) not null,
  method text not null default 'demo',          -- demo/manual ở MVP; gateway thật ở phase mở rộng
  status text not null default 'pending',
  reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table sales_notes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references booking_requests(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  author_id uuid not null references profiles(id),
  content text not null,
  created_at timestamptz not null default now(),
  check (booking_id is not null or order_id is not null)
);
```

## 7. Notification, audit & RAG

```sql
create table notification_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  type text not null,                           -- vd booking_status_changed, order_paid
  channel text not null default 'in_app',       -- in_app/email/zalo (zalo: Phase mở rộng)
  payload jsonb not null default '{}',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,                         -- vd product.publish, booking.status_change
  entity_type text not null,
  entity_id uuid not null,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create table knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source text,
  created_at timestamptz not null default now()
);

create table knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references knowledge_documents(id) on delete cascade,
  content text not null,
  embedding vector(1536),
  created_at timestamptz not null default now()
);
```

## 8. Function & trigger chính

```sql
create or replace function is_admin() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql security definer stable;

create or replace function current_role_name() returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer stable;

create or replace function next_booking_code() returns text as $$
declare
  yr text := to_char(now(), 'YYYY');
  seq int;
begin
  select count(*) + 1 into seq from booking_requests where code like 'NBG-' || yr || '-%';
  return 'NBG-' || yr || '-' || lpad(seq::text, 4, '0');
end;
$$ language plpgsql;

create or replace function next_order_code() returns text as $$
declare
  yr text := to_char(now(), 'YYYY');
  seq int;
begin
  select count(*) + 1 into seq from orders where code like 'NBO-' || yr || '-%';
  return 'NBO-' || yr || '-' || lpad(seq::text, 4, '0');
end;
$$ language plpgsql;

create or replace function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, email, role)
  values (new.id, new.email, 'buyer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

## 9. Row Level Security (mẫu chính sách)

Nguyên tắc: **mọi bảng user-scoped bật RLS**; Buyer chỉ thấy dữ liệu của chính mình; Sales thấy
booking/order được giao + tất cả ở mức đọc cho xử lý; Editor thấy sản phẩm/bài viết của mình +
tất cả ở mức đọc; Admin full access qua `is_admin()`.

```sql
alter table profiles enable row level security;
create policy "profiles: self read/update" on profiles
  for select using (id = auth.uid() or is_admin());
create policy "profiles: self update" on profiles
  for update using (id = auth.uid() or is_admin());

alter table products enable row level security;
create policy "products: public read published" on products
  for select using (status = 'published' and is_active or is_admin()
    or (current_role_name() in ('editor', 'sales') ));
create policy "products: editor write own or admin" on products
  for insert with check (current_role_name() in ('editor', 'admin'));
create policy "products: editor update own or admin" on products
  for update using (created_by = auth.uid() or is_admin());

alter table trip_requests enable row level security;
create policy "trip_requests: owner only" on trip_requests
  for all using (user_id = auth.uid() or is_admin());

alter table cart_items enable row level security;
create policy "cart_items: owner only" on cart_items
  for all using (user_id = auth.uid());

alter table booking_requests enable row level security;
create policy "booking_requests: owner read" on booking_requests
  for select using (user_id = auth.uid() or current_role_name() in ('sales','admin'));
create policy "booking_requests: sales/admin update" on booking_requests
  for update using (current_role_name() in ('sales','admin'));

alter table orders enable row level security;
create policy "orders: owner read" on orders
  for select using (user_id = auth.uid() or current_role_name() in ('sales','admin'));
create policy "orders: sales/admin update" on orders
  for update using (current_role_name() in ('sales','admin'));

alter table audit_logs enable row level security;
create policy "audit_logs: admin only" on audit_logs
  for select using (is_admin());
```

> Áp dụng cùng mẫu cho `booking_items`, `booking_status_logs`, `order_items`,
> `order_status_logs`, `payments`, `sales_notes`, `saved_products`,
> `recently_viewed_products`, `notification_events`, `articles`, `product_images`,
> `product_locations` (đọc public nếu sản phẩm/bài viết published, viết theo role).

## 10. Seed data (tối thiểu cho demo)

| Loại | Số lượng tối thiểu |
|---|---|
| `destinations` | 1 (Ninh Bình) + 7 sub-location trong `description`/tags |
| `products` (`tour`) | 6 |
| `products` (`homestay`) | 5 |
| `products` (`hotel`) | 5 |
| `products` (`restaurant`) | 5 |
| `products` (`transport`) | 4 |
| `products` (`combo`) | 3 |
| `product_locations` | 1 dòng / sản phẩm (toạ độ thật khu Ninh Bình) |
| `articles` | 4 (guide/FAQ) |
| `knowledge_documents` + `knowledge_chunks` | 4 tài liệu chính sách/FAQ |
| Demo users | 1/role: `buyer@nibigo.demo`, `sales@nibigo.demo`, `editor@nibigo.demo`, `admin@nibigo.demo` |

Ví dụ record `products`:

```json
{
  "type": "homestay",
  "name": "Tam Coc Riverside Homestay",
  "slug": "tam-coc-riverside-homestay",
  "price": 450000,
  "price_unit": "per_night",
  "tags": ["riverside", "family", "quiet"],
  "suitable_for": ["family", "couple"],
  "availability_status": "available",
  "status": "published"
}
```

## 11. Migration path từ MVP-Core đã build (ĐÃ triển khai ở Phase 8)

Hai migration nối tiếp, **không sửa** `0001`/`0002`/`0003`. Chạy theo thứ tự, **commit `0004`
trước rồi mới `0005`** (Postgres không cho dùng enum value vừa `ADD VALUE` trong cùng transaction):

1. **`0004_expand_schema.sql`:**
   - `user_role`: `RENAME VALUE 'guest' → 'buyer'` (giữ nguyên data, default tự đổi) + `ADD VALUE 'sales'`, `'editor'`.
   - `product_type` `ADD VALUE 'homestay'`; `availability_status` `ADD VALUE 'need_confirmation'`;
     `booking_status` `ADD VALUE 'checking_availability'`, `'waiting_payment'`, `'completed'`.
   - Enum mới: `content_status`, `order_status`, `payment_status`.
   - `handle_new_user()` → mặc định `'buyer'`.
   - `ALTER TABLE travel_products RENAME TO products` + thêm `status content_status default 'published'`, `created_by`, `slug`.
   - `tour_package_items.travel_product_id` → `product_id`.
   - `booking_status_history` → `booking_status_logs`; `booking_requests` thêm `payment_status`, `assigned_sales_id`.
   - Tạo bảng mới §3–§7: `product_images`, `product_locations`, `articles`, `cart_items`,
     `saved_products`, `recently_viewed_products`, `orders`, `order_items`, `order_status_logs`,
     `payments`, `sales_notes`, `notification_events`, `audit_logs` + `next_order_code()`.
2. **`0005_rls_roles.sql`:** helper `current_app_role()`/`is_staff()`/`is_sales()`/`is_editor()`
   + policy 4 role cho mọi bảng mới và cập nhật policy `products`/`booking_requests`.
3. **Lưu ý taxonomy:** giữ `'activity'` làm bucket tour/trải nghiệm (engine MVP phụ thuộc);
   `'homestay'` được engine gộp vào nhóm lưu trú `'hotel'` (`lib/tour-engine/filter.ts` →
   `groupKey`). Khi seed thêm homestay, chúng tự thành ứng viên chỗ ở cho AI packager.
4. **Seed v2** (chưa bắt buộc cho build): thêm `homestay`, `articles`, `product_locations`,
   demo users `sales@`/`editor@` — không xóa seed cũ. Xem `supabase/README.md`.
