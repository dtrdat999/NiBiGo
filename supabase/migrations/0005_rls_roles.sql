-- ─────────────────────────────────────────────────────────────
-- NiBiGo AI Travel Platform — 0005_rls_roles
-- Phase 8: RLS cho 4 role + các bảng commerce/CMS mới.
-- ⚠️ Chạy SAU khi 0004 đã commit (cần enum value 'sales'/'editor').
-- ─────────────────────────────────────────────────────────────

-- ── Helper role ──────────────────────────────────────────────
create or replace function public.current_app_role()
returns user_role language sql security definer stable set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('sales', 'editor', 'admin')
  );
$$;

create or replace function public.is_sales()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('sales', 'admin')
  );
$$;

create or replace function public.is_editor()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('editor', 'admin')
  );
$$;

-- ── profiles: admin được cập nhật role người khác ────────────
drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- ── products: đọc published+active hoặc staff; ghi editor/admin ──
drop policy if exists products_read on public.products;
create policy products_read on public.products
  for select using ((status = 'published' and is_active) or public.is_staff());

drop policy if exists products_admin_write on public.products;
drop policy if exists products_editor_write on public.products;
create policy products_editor_insert on public.products
  for insert with check (public.is_editor());
create policy products_editor_update on public.products
  for update using (public.is_admin() or created_by = auth.uid())
  with check (public.is_admin() or created_by = auth.uid());
create policy products_admin_delete on public.products
  for delete using (public.is_admin());

-- ── product_images / product_locations ───────────────────────
alter table public.product_images    enable row level security;
alter table public.product_locations enable row level security;

drop policy if exists product_images_read on public.product_images;
create policy product_images_read on public.product_images
  for select using (
    exists (select 1 from public.products p
            where p.id = product_id and ((p.status='published' and p.is_active) or public.is_staff()))
  );
drop policy if exists product_images_write on public.product_images;
create policy product_images_write on public.product_images
  for all using (public.is_editor()) with check (public.is_editor());

drop policy if exists product_locations_read on public.product_locations;
create policy product_locations_read on public.product_locations
  for select using (
    exists (select 1 from public.products p
            where p.id = product_id and ((p.status='published' and p.is_active) or public.is_staff()))
  );
drop policy if exists product_locations_write on public.product_locations;
create policy product_locations_write on public.product_locations
  for all using (public.is_editor()) with check (public.is_editor());

-- ── articles ─────────────────────────────────────────────────
alter table public.articles enable row level security;
drop policy if exists articles_read on public.articles;
create policy articles_read on public.articles
  for select using (status = 'published' or public.is_staff());
drop policy if exists articles_editor_insert on public.articles;
create policy articles_editor_insert on public.articles
  for insert with check (public.is_editor());
drop policy if exists articles_editor_update on public.articles;
create policy articles_editor_update on public.articles
  for update using (public.is_admin() or author_id = auth.uid())
  with check (public.is_admin() or author_id = auth.uid());

-- ── cart / saved / recently viewed (chủ sở hữu) ──────────────
alter table public.cart_items               enable row level security;
alter table public.saved_products           enable row level security;
alter table public.recently_viewed_products enable row level security;

drop policy if exists cart_owner on public.cart_items;
create policy cart_owner on public.cart_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists saved_owner on public.saved_products;
create policy saved_owner on public.saved_products
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists recent_owner on public.recently_viewed_products;
create policy recent_owner on public.recently_viewed_products
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── booking_requests: sales/admin đọc+cập nhật (mở rộng từ admin-only) ──
drop policy if exists bookings_admin_update on public.booking_requests;
drop policy if exists bookings_owner_read on public.booking_requests;
create policy bookings_owner_read on public.booking_requests
  for select using (user_id = auth.uid() or public.is_sales());
create policy bookings_sales_update on public.booking_requests
  for update using (public.is_sales()) with check (public.is_sales());

-- booking_status_logs (đổi tên từ booking_status_history): đọc theo booking; ghi staff
alter table public.booking_status_logs enable row level security;
drop policy if exists history_select on public.booking_status_logs;
drop policy if exists logs_select on public.booking_status_logs;
create policy logs_select on public.booking_status_logs
  for select using (
    exists (select 1 from public.booking_requests b
            where b.id = booking_request_id and (b.user_id = auth.uid() or public.is_sales()))
  );
drop policy if exists history_admin_insert on public.booking_status_logs;
drop policy if exists logs_staff_insert on public.booking_status_logs;
create policy logs_staff_insert on public.booking_status_logs
  for insert with check (public.is_sales());

-- ── orders + items + logs + payments ─────────────────────────
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.order_status_logs enable row level security;
alter table public.payments          enable row level security;

drop policy if exists orders_owner_read on public.orders;
create policy orders_owner_read on public.orders
  for select using (user_id = auth.uid() or public.is_sales());
drop policy if exists orders_owner_create on public.orders;
create policy orders_owner_create on public.orders
  for insert with check (user_id = auth.uid());
drop policy if exists orders_sales_update on public.orders;
create policy orders_sales_update on public.orders
  for update using (public.is_sales()) with check (public.is_sales());

drop policy if exists order_items_read on public.order_items;
create policy order_items_read on public.order_items
  for select using (
    exists (select 1 from public.orders o
            where o.id = order_id and (o.user_id = auth.uid() or public.is_sales()))
  );
drop policy if exists order_items_create on public.order_items;
create policy order_items_create on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

drop policy if exists order_logs_read on public.order_status_logs;
create policy order_logs_read on public.order_status_logs
  for select using (
    exists (select 1 from public.orders o
            where o.id = order_id and (o.user_id = auth.uid() or public.is_sales()))
  );
drop policy if exists order_logs_insert on public.order_status_logs;
create policy order_logs_insert on public.order_status_logs
  for insert with check (public.is_sales());

drop policy if exists payments_read on public.payments;
create policy payments_read on public.payments
  for select using (
    exists (select 1 from public.orders o
            where o.id = order_id and (o.user_id = auth.uid() or public.is_sales()))
  );

-- ── sales_notes (chỉ staff) ──────────────────────────────────
alter table public.sales_notes enable row level security;
drop policy if exists sales_notes_staff on public.sales_notes;
create policy sales_notes_staff on public.sales_notes
  for all using (public.is_sales()) with check (public.is_sales());

-- ── notification_events (chủ sở hữu đọc; admin tất cả) ───────
alter table public.notification_events enable row level security;
drop policy if exists notif_owner_read on public.notification_events;
create policy notif_owner_read on public.notification_events
  for select using (user_id = auth.uid() or public.is_admin());

-- ── audit_logs (chỉ admin đọc) ───────────────────────────────
alter table public.audit_logs enable row level security;
drop policy if exists audit_admin_read on public.audit_logs;
create policy audit_admin_read on public.audit_logs
  for select using (public.is_admin());
