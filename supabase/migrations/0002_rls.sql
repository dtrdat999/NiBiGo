-- ─────────────────────────────────────────────────────────────
-- NiBiGo AI Planner — 0002_rls
-- Bật Row Level Security + policy. Khớp docs/DATA_SCHEMA.md §4.
-- Nguyên tắc: guest chỉ thấy dữ liệu của mình; admin thấy tất cả;
-- ghi giá/booking/gói tour thực hiện server-side bằng service role (bỏ qua RLS).
-- ─────────────────────────────────────────────────────────────

-- Helper kiểm tra admin (security definer để không đệ quy RLS trên profiles)
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ── profiles ─────────────────────────────────────────────────
alter table public.profiles enable row level security;

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ── destinations (đọc công khai khi active; ghi: admin) ──────
alter table public.destinations enable row level security;

drop policy if exists destinations_read on public.destinations;
create policy destinations_read on public.destinations
  for select using (is_active or public.is_admin());

drop policy if exists destinations_admin_write on public.destinations;
create policy destinations_admin_write on public.destinations
  for all using (public.is_admin()) with check (public.is_admin());

-- ── travel_products (đọc khi active; ghi: admin) ─────────────
alter table public.travel_products enable row level security;

drop policy if exists products_read on public.travel_products;
create policy products_read on public.travel_products
  for select using (is_active or public.is_admin());

drop policy if exists products_admin_write on public.travel_products;
create policy products_admin_write on public.travel_products
  for all using (public.is_admin()) with check (public.is_admin());

-- ── trip_requests (chủ sở hữu CRUD; admin đọc) ───────────────
alter table public.trip_requests enable row level security;

drop policy if exists trips_owner_select on public.trip_requests;
create policy trips_owner_select on public.trip_requests
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists trips_owner_insert on public.trip_requests;
create policy trips_owner_insert on public.trip_requests
  for insert with check (user_id = auth.uid());

drop policy if exists trips_owner_update on public.trip_requests;
create policy trips_owner_update on public.trip_requests
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── tour_packages (đọc nếu là chủ trip hoặc admin; ghi qua service role) ──
alter table public.tour_packages enable row level security;

drop policy if exists packages_select on public.tour_packages;
create policy packages_select on public.tour_packages
  for select using (
    exists (
      select 1 from public.trip_requests t
      where t.id = trip_request_id and (t.user_id = auth.uid() or public.is_admin())
    )
  );

-- ── tour_package_items (đọc theo gói của mình hoặc admin) ────
alter table public.tour_package_items enable row level security;

drop policy if exists items_select on public.tour_package_items;
create policy items_select on public.tour_package_items
  for select using (
    exists (
      select 1
      from public.tour_packages p
      join public.trip_requests t on t.id = p.trip_request_id
      where p.id = tour_package_id and (t.user_id = auth.uid() or public.is_admin())
    )
  );

-- ── booking_requests (chủ đọc/tạo; admin đọc/cập nhật) ───────
alter table public.booking_requests enable row level security;

drop policy if exists bookings_owner_read on public.booking_requests;
create policy bookings_owner_read on public.booking_requests
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists bookings_owner_create on public.booking_requests;
create policy bookings_owner_create on public.booking_requests
  for insert with check (user_id = auth.uid());

drop policy if exists bookings_admin_update on public.booking_requests;
create policy bookings_admin_update on public.booking_requests
  for update using (public.is_admin()) with check (public.is_admin());

-- ── booking_status_history (đọc theo booking của mình; ghi: admin) ──
alter table public.booking_status_history enable row level security;

drop policy if exists history_select on public.booking_status_history;
create policy history_select on public.booking_status_history
  for select using (
    exists (
      select 1 from public.booking_requests b
      where b.id = booking_request_id and (b.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists history_admin_insert on public.booking_status_history;
create policy history_admin_insert on public.booking_status_history
  for insert with check (public.is_admin());
