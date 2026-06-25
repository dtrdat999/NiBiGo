-- Sales workspace cần đọc trip/package/items liên quan tới booking để tư vấn.
-- Mutation booking vẫn bị giới hạn bởi policy Sales hiện có và route handler.

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid() or public.is_sales());

drop policy if exists trips_owner_select on public.trip_requests;
create policy trips_owner_select on public.trip_requests
  for select using (user_id = auth.uid() or public.is_sales());

drop policy if exists packages_select on public.tour_packages;
create policy packages_select on public.tour_packages
  for select using (
    exists (
      select 1 from public.trip_requests t
      where t.id = trip_request_id
        and (t.user_id = auth.uid() or public.is_sales())
    )
  );

drop policy if exists items_select on public.tour_package_items;
create policy items_select on public.tour_package_items
  for select using (
    exists (
      select 1
      from public.tour_packages p
      join public.trip_requests t on t.id = p.trip_request_id
      where p.id = tour_package_id
        and (t.user_id = auth.uid() or public.is_sales())
    )
  );

-- Assignment và các thao tác Sales được ghi audit bằng service role.
-- Sales được đọc audit liên quan booking để truy vết trong workspace.
drop policy if exists audit_sales_booking_read on public.audit_logs;
create policy audit_sales_booking_read on public.audit_logs
  for select using (
    public.is_sales()
    and entity_type = 'booking_request'
  );
