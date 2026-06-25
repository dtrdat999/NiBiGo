-- Sales Contact & Follow-up Workflow
-- Quản lý quá trình liên hệ khách: trạng thái liên hệ + lịch follow-up có hạn.
-- Nối tiếp 0008. Chạy trên Supabase SQL Editor (1 lần Run).

-- ── 1. Trạng thái liên hệ + thời điểm liên hệ gần nhất ───────
alter table public.booking_requests
  add column if not exists contact_status text not null default 'not_contacted',
  add column if not exists last_contacted_at timestamptz;

alter table public.booking_requests
  drop constraint if exists booking_requests_contact_status_check;
alter table public.booking_requests
  add constraint booking_requests_contact_status_check
  check (contact_status in (
    'not_contacted', 'contacted', 'no_response',
    'interested', 'negotiating', 'confirmed', 'lost'
  ));

-- ── 2. Bảng follow-up ────────────────────────────────────────
create table if not exists public.booking_followups (
  id                 uuid primary key default gen_random_uuid(),
  booking_request_id uuid not null references public.booking_requests(id) on delete cascade,
  due_at             timestamptz not null,
  content            text not null,
  follow_up_type     text not null default 'call_attempt'
                       check (follow_up_type in (
                         'call_attempt', 'zalo_message', 'email_sent',
                         'callback_requested', 'price_discussion',
                         'itinerary_discussion', 'waiting_partner'
                       )),
  status             text not null default 'open' check (status in ('open', 'done', 'cancelled')),
  result_note        text,
  created_by         uuid references public.profiles(id),
  done_by            uuid references public.profiles(id),
  done_at            timestamptz,
  created_at         timestamptz not null default now()
);

create index if not exists idx_followups_booking on public.booking_followups (booking_request_id);
create index if not exists idx_followups_open on public.booking_followups (status, due_at);

alter table public.booking_followups enable row level security;

drop policy if exists followups_read on public.booking_followups;
create policy followups_read on public.booking_followups
  for select using (
    public.is_sales()
    or exists (
      select 1 from public.booking_requests b
      where b.id = booking_request_id and b.user_id = auth.uid()
    )
  );
-- Ghi chỉ qua SECURITY DEFINER functions bên dưới.

-- ── helper: nạp booking + kiểm role/assignment ──────────────
-- (lặp lại inline trong từng function để giữ tính nguyên tử + rõ ràng)

-- ── 3. Tạo follow-up ─────────────────────────────────────────
create or replace function public.sales_create_followup(
  p_booking_id uuid,
  p_due_at timestamptz,
  p_content text,
  p_type text default 'call_attempt'
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
  v_row booking_followups%rowtype;
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

  if p_due_at is null then
    raise exception 'Cần chọn thời điểm cần follow-up';
  end if;
  if char_length(btrim(coalesce(p_content, ''))) < 3
     or char_length(btrim(coalesce(p_content, ''))) > 2000 then
    raise exception 'Nội dung follow-up cần từ 3 đến 2.000 ký tự';
  end if;
  if p_type not in (
    'call_attempt', 'zalo_message', 'email_sent', 'callback_requested',
    'price_discussion', 'itinerary_discussion', 'waiting_partner'
  ) then
    raise exception 'Loại follow-up không hợp lệ';
  end if;

  insert into public.booking_followups
    (booking_request_id, due_at, content, follow_up_type, created_by)
  values
    (p_booking_id, p_due_at, btrim(p_content), p_type, v_actor_id)
  returning * into v_row;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, after)
  values (
    v_actor_id, 'booking.followup_created', 'booking_request', p_booking_id,
    jsonb_build_object('followup_id', v_row.id, 'due_at', v_row.due_at, 'type', v_row.follow_up_type)
  );

  return jsonb_build_object('id', v_row.id, 'due_at', v_row.due_at);
end;
$$;

-- ── 4. Hoàn thành follow-up (ghi kết quả liên hệ) ────────────
create or replace function public.sales_complete_followup(
  p_followup_id uuid,
  p_result_note text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role user_role;
  v_followup booking_followups%rowtype;
  v_booking booking_requests%rowtype;
begin
  select role into v_role from public.profiles where id = v_actor_id;
  if v_role is null or v_role not in ('sales', 'admin') then
    raise exception 'Bạn không có quyền cập nhật booking này';
  end if;

  select * into v_followup from public.booking_followups where id = p_followup_id for update;
  if not found then
    raise exception 'Không tìm thấy follow-up';
  end if;
  if v_followup.status <> 'open' then
    raise exception 'Follow-up này đã được xử lý';
  end if;

  select * into v_booking from public.booking_requests
    where id = v_followup.booking_request_id for update;
  if v_role = 'sales' and v_booking.assigned_sales_id is distinct from v_actor_id then
    raise exception 'Booking chưa được phân công cho bạn';
  end if;

  if char_length(btrim(coalesce(p_result_note, ''))) < 3
     or char_length(btrim(coalesce(p_result_note, ''))) > 2000 then
    raise exception 'Cần ghi kết quả liên hệ (3–2.000 ký tự)';
  end if;

  update public.booking_followups
  set status = 'done', result_note = btrim(p_result_note),
      done_by = v_actor_id, done_at = now()
  where id = p_followup_id;

  update public.booking_requests
  set last_contacted_at = now()
  where id = v_followup.booking_request_id;

  insert into public.sales_notes (booking_request_id, author_id, content, note_type)
  values (
    v_followup.booking_request_id, v_actor_id,
    'Kết quả follow-up: ' || btrim(p_result_note), 'contact_attempt'
  );

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, after)
  values (
    v_actor_id, 'booking.followup_completed', 'booking_request',
    v_followup.booking_request_id, jsonb_build_object('followup_id', p_followup_id)
  );

  return jsonb_build_object('id', p_followup_id, 'status', 'done');
end;
$$;

-- ── 5. Hủy follow-up ─────────────────────────────────────────
create or replace function public.sales_cancel_followup(
  p_followup_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role user_role;
  v_followup booking_followups%rowtype;
  v_booking booking_requests%rowtype;
begin
  select role into v_role from public.profiles where id = v_actor_id;
  if v_role is null or v_role not in ('sales', 'admin') then
    raise exception 'Bạn không có quyền cập nhật booking này';
  end if;

  select * into v_followup from public.booking_followups where id = p_followup_id for update;
  if not found then
    raise exception 'Không tìm thấy follow-up';
  end if;
  if v_followup.status <> 'open' then
    raise exception 'Follow-up này đã được xử lý';
  end if;

  select * into v_booking from public.booking_requests
    where id = v_followup.booking_request_id for update;
  if v_role = 'sales' and v_booking.assigned_sales_id is distinct from v_actor_id then
    raise exception 'Booking chưa được phân công cho bạn';
  end if;

  update public.booking_followups
  set status = 'cancelled',
      result_note = nullif(btrim(coalesce(p_reason, '')), ''),
      done_by = v_actor_id, done_at = now()
  where id = p_followup_id;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, after)
  values (
    v_actor_id, 'booking.followup_cancelled', 'booking_request',
    v_followup.booking_request_id, jsonb_build_object('followup_id', p_followup_id)
  );

  return jsonb_build_object('id', p_followup_id, 'status', 'cancelled');
end;
$$;

-- ── 6. Đặt trạng thái liên hệ ────────────────────────────────
create or replace function public.sales_set_contact_status(
  p_booking_id uuid,
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

  if p_status not in (
    'not_contacted', 'contacted', 'no_response',
    'interested', 'negotiating', 'confirmed', 'lost'
  ) then
    raise exception 'Trạng thái liên hệ không hợp lệ';
  end if;

  update public.booking_requests
  set contact_status = p_status,
      last_contacted_at = case
        when p_status = 'not_contacted' then last_contacted_at
        else now()
      end
  where id = p_booking_id;

  if p_note is not null and char_length(btrim(p_note)) > 0 then
    insert into public.sales_notes (booking_request_id, author_id, content, note_type)
    values (p_booking_id, v_actor_id, btrim(p_note), 'contact_attempt');
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, before, after)
  values (
    v_actor_id, 'booking.contact_status_set', 'booking_request', p_booking_id,
    jsonb_build_object('contact_status', v_booking.contact_status),
    jsonb_build_object('contact_status', p_status)
  );

  return jsonb_build_object('id', p_booking_id, 'contact_status', p_status);
end;
$$;

-- ── 7. Quyền thực thi ────────────────────────────────────────
revoke all on function public.sales_create_followup(uuid, timestamptz, text, text) from public;
revoke all on function public.sales_complete_followup(uuid, text) from public;
revoke all on function public.sales_cancel_followup(uuid, text) from public;
revoke all on function public.sales_set_contact_status(uuid, text, text) from public;
grant execute on function public.sales_create_followup(uuid, timestamptz, text, text) to authenticated;
grant execute on function public.sales_complete_followup(uuid, text) to authenticated;
grant execute on function public.sales_cancel_followup(uuid, text) to authenticated;
grant execute on function public.sales_set_contact_status(uuid, text, text) to authenticated;
