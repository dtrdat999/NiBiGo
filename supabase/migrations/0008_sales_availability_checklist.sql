-- Sales Availability Checklist + Final Price
-- Khu vực xác nhận dịch vụ trước khi chuyển booking sang chờ thanh toán.
-- Nối tiếp 0007. Chạy trên Supabase SQL Editor.

-- ── 1. Cột giá cuối + đồng ý của khách trên booking_requests ──
alter table public.booking_requests
  add column if not exists final_price integer,
  add column if not exists final_price_note text,
  add column if not exists final_price_confirmed_at timestamptz,
  add column if not exists customer_agreed boolean not null default false;

-- ── 2. Bảng checklist khả dụng theo nhóm dịch vụ ─────────────
create table if not exists public.booking_availability_checks (
  id                 uuid primary key default gen_random_uuid(),
  booking_request_id uuid not null references public.booking_requests(id) on delete cascade,
  category           text not null check (category in ('accommodation', 'transport', 'activity', 'restaurant')),
  status             text not null default 'pending'
                       check (status in ('pending', 'available', 'limited', 'not_available', 'replaced')),
  note               text,
  updated_by         uuid references public.profiles(id),
  updated_at         timestamptz not null default now(),
  created_at         timestamptz not null default now(),
  unique (booking_request_id, category)
);

create index if not exists idx_availability_checks_booking
  on public.booking_availability_checks (booking_request_id);

alter table public.booking_availability_checks enable row level security;

drop policy if exists availability_checks_read on public.booking_availability_checks;
create policy availability_checks_read on public.booking_availability_checks
  for select using (
    public.is_sales()
    or exists (
      select 1 from public.booking_requests b
      where b.id = booking_request_id and b.user_id = auth.uid()
    )
  );
-- Ghi chỉ qua SECURITY DEFINER functions bên dưới (không mở policy write trực tiếp).

-- ── 3. Cập nhật trạng thái khả dụng 1 nhóm dịch vụ ───────────
create or replace function public.sales_update_availability(
  p_booking_id uuid,
  p_category text,
  p_status text,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role user_role;
  v_booking booking_requests%rowtype;
  v_row booking_availability_checks%rowtype;
begin
  select role into v_role from public.profiles where id = v_actor_id;
  if v_role is null or v_role not in ('sales', 'admin') then
    raise exception 'Bạn không có quyền cập nhật booking này';
  end if;

  select * into v_booking from public.booking_requests where id = p_booking_id for update;
  if not found then
    raise exception 'Không tìm thấy booking';
  end if;
  if v_role = 'sales' and v_booking.assigned_sales_id is distinct from v_actor_id then
    raise exception 'Booking chưa được phân công cho bạn';
  end if;

  if p_category not in ('accommodation', 'transport', 'activity', 'restaurant') then
    raise exception 'Nhóm dịch vụ không hợp lệ';
  end if;
  if p_status not in ('pending', 'available', 'limited', 'not_available', 'replaced') then
    raise exception 'Trạng thái khả dụng không hợp lệ';
  end if;
  if p_note is not null and char_length(btrim(p_note)) > 2000 then
    raise exception 'Ghi chú không được vượt quá 2.000 ký tự';
  end if;

  insert into public.booking_availability_checks
    (booking_request_id, category, status, note, updated_by, updated_at)
  values
    (p_booking_id, p_category, p_status, nullif(btrim(coalesce(p_note, '')), ''), v_actor_id, now())
  on conflict (booking_request_id, category)
  do update set
    status = excluded.status,
    note = excluded.note,
    updated_by = excluded.updated_by,
    updated_at = now()
  returning * into v_row;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, after)
  values (
    v_actor_id,
    'booking.availability_updated',
    'booking_request',
    p_booking_id,
    jsonb_build_object('category', p_category, 'status', p_status)
  );

  return jsonb_build_object('id', v_row.id, 'category', v_row.category, 'status', v_row.status);
end;
$$;

-- ── 4. Xác nhận giá cuối (bắt buộc nêu lý do) ────────────────
create or replace function public.sales_confirm_final_price(
  p_booking_id uuid,
  p_final_price integer,
  p_note text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role user_role;
  v_booking booking_requests%rowtype;
begin
  select role into v_role from public.profiles where id = v_actor_id;
  if v_role is null or v_role not in ('sales', 'admin') then
    raise exception 'Bạn không có quyền cập nhật booking này';
  end if;

  select * into v_booking from public.booking_requests where id = p_booking_id for update;
  if not found then
    raise exception 'Không tìm thấy booking';
  end if;
  if v_role = 'sales' and v_booking.assigned_sales_id is distinct from v_actor_id then
    raise exception 'Booking chưa được phân công cho bạn';
  end if;

  if p_final_price is null or p_final_price <= 0 then
    raise exception 'Giá cuối phải là số dương';
  end if;
  if char_length(btrim(coalesce(p_note, ''))) < 5
     or char_length(btrim(coalesce(p_note, ''))) > 2000 then
    raise exception 'Vui lòng ghi rõ lý do/cơ sở của giá cuối';
  end if;

  update public.booking_requests
  set final_price = p_final_price,
      final_price_note = btrim(p_note),
      final_price_confirmed_at = now()
  where id = p_booking_id;

  -- Lưu thành ghi chú để xuất hiện trong dòng thời gian xử lý.
  insert into public.sales_notes (booking_request_id, author_id, content, note_type)
  values (
    p_booking_id,
    v_actor_id,
    'Giá cuối: ' || to_char(p_final_price, 'FM999G999G999') || ' đ. ' || btrim(p_note),
    'price_discussion'
  );

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, before, after)
  values (
    v_actor_id,
    'booking.final_price_updated',
    'booking_request',
    p_booking_id,
    jsonb_build_object('final_price', v_booking.final_price),
    jsonb_build_object('final_price', p_final_price)
  );

  return jsonb_build_object('id', p_booking_id, 'final_price', p_final_price);
end;
$$;

-- ── 5. Đánh dấu khách đồng ý / chưa đồng ý lịch trình ────────
create or replace function public.sales_set_customer_agreement(
  p_booking_id uuid,
  p_agreed boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role user_role;
  v_booking booking_requests%rowtype;
begin
  select role into v_role from public.profiles where id = v_actor_id;
  if v_role is null or v_role not in ('sales', 'admin') then
    raise exception 'Bạn không có quyền cập nhật booking này';
  end if;

  select * into v_booking from public.booking_requests where id = p_booking_id for update;
  if not found then
    raise exception 'Không tìm thấy booking';
  end if;
  if v_role = 'sales' and v_booking.assigned_sales_id is distinct from v_actor_id then
    raise exception 'Booking chưa được phân công cho bạn';
  end if;

  update public.booking_requests
  set customer_agreed = coalesce(p_agreed, false)
  where id = p_booking_id;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, after)
  values (
    v_actor_id,
    'booking.customer_agreement_set',
    'booking_request',
    p_booking_id,
    jsonb_build_object('customer_agreed', coalesce(p_agreed, false))
  );

  return jsonb_build_object('id', p_booking_id, 'customer_agreed', coalesce(p_agreed, false));
end;
$$;

-- ── 6. Mở rộng transition: checking_availability → waiting_payment (có gate) ──
create or replace function public.sales_transition_booking(
  p_booking_id uuid,
  p_to_status booking_status,
  p_note text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role user_role;
  v_booking booking_requests%rowtype;
  v_note_type text;
  v_allowed boolean := false;
  v_note sales_notes%rowtype;
  v_ready_categories int;
begin
  select role into v_role from public.profiles where id = v_actor_id;
  if v_role is null or v_role not in ('sales', 'admin') then
    raise exception 'Bạn không có quyền cập nhật booking này';
  end if;

  select * into v_booking from public.booking_requests where id = p_booking_id for update;
  if not found then
    raise exception 'Không tìm thấy booking';
  end if;
  if v_role = 'sales' and v_booking.assigned_sales_id is distinct from v_actor_id then
    raise exception 'Booking chưa được phân công cho bạn';
  end if;

  if char_length(btrim(coalesce(p_note, ''))) < 5
     or char_length(btrim(coalesce(p_note, ''))) > 2000 then
    raise exception 'Vui lòng ghi rõ kết quả xử lý';
  end if;

  if v_booking.status = 'new' and p_to_status = 'contacted' then
    v_allowed := true;
    v_note_type := 'contact_attempt';
  elsif v_booking.status = 'contacted' and p_to_status = 'checking_availability' then
    v_allowed := true;
    v_note_type := 'customer_preference';
  elsif v_booking.status = 'checking_availability' and p_to_status = 'waiting_payment' then
    -- Gate: đủ 4 nhóm dịch vụ không còn pending/not_available + giá cuối + khách đồng ý.
    select count(*) into v_ready_categories
    from public.booking_availability_checks
    where booking_request_id = p_booking_id
      and category in ('accommodation', 'transport', 'activity', 'restaurant')
      and status in ('available', 'limited', 'replaced');

    if v_ready_categories < 4 then
      raise exception 'Cần xác nhận đủ 4 nhóm dịch vụ (không còn Chưa kiểm tra/Không khả dụng) trước khi chuyển chờ thanh toán';
    end if;
    if v_booking.final_price is null then
      raise exception 'Cần xác nhận giá cuối trước khi chuyển chờ thanh toán';
    end if;
    if not coalesce(v_booking.customer_agreed, false) then
      raise exception 'Cần xác nhận khách đồng ý với lịch trình trước khi chuyển chờ thanh toán';
    end if;
    v_allowed := true;
    v_note_type := 'partner_confirmation';
  elsif v_booking.status in ('new', 'contacted', 'checking_availability')
        and p_to_status = 'cancelled' then
    v_allowed := true;
    v_note_type := 'risk_warning';
  end if;

  if not v_allowed then
    raise exception 'Chuyển trạng thái không hợp lệ từ % sang %',
      v_booking.status, p_to_status;
  end if;

  insert into public.sales_notes (booking_request_id, author_id, content, note_type)
  values (p_booking_id, v_actor_id, btrim(p_note), v_note_type)
  returning * into v_note;

  update public.booking_requests set status = p_to_status where id = p_booking_id;

  insert into public.booking_status_logs
    (booking_request_id, from_status, to_status, changed_by, note)
  values (p_booking_id, v_booking.status, p_to_status, v_actor_id, btrim(p_note));

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, before, after)
  values (
    v_actor_id,
    'booking.status_changed',
    'booking_request',
    p_booking_id,
    jsonb_build_object('status', v_booking.status),
    jsonb_build_object('status', p_to_status, 'note_id', v_note.id)
  );

  return jsonb_build_object(
    'id', p_booking_id,
    'from_status', v_booking.status,
    'status', p_to_status,
    'note_id', v_note.id
  );
end;
$$;

-- ── 7. Quyền thực thi ────────────────────────────────────────
revoke all on function public.sales_update_availability(uuid, text, text, text) from public;
revoke all on function public.sales_confirm_final_price(uuid, integer, text) from public;
revoke all on function public.sales_set_customer_agreement(uuid, boolean) from public;
grant execute on function public.sales_update_availability(uuid, text, text, text) to authenticated;
grant execute on function public.sales_confirm_final_price(uuid, integer, text) to authenticated;
grant execute on function public.sales_set_customer_agreement(uuid, boolean) to authenticated;
grant execute on function public.sales_transition_booking(uuid, booking_status, text) to authenticated;
