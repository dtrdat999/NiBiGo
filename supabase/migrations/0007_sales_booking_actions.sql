-- Sales Booking Actions:
-- structured note types, assignment-aware writes and atomic audited mutations.

alter table public.sales_notes
  add column if not exists note_type text not null default 'general';

alter table public.sales_notes
  drop constraint if exists sales_notes_note_type_check;

alter table public.sales_notes
  add constraint sales_notes_note_type_check
  check (
    note_type in (
      'contact_attempt',
      'customer_preference',
      'price_discussion',
      'partner_confirmation',
      'risk_warning',
      'follow_up',
      'general'
    )
  );

create index if not exists idx_sales_notes_booking_created
  on public.sales_notes (booking_request_id, created_at desc);

drop policy if exists bookings_sales_update on public.booking_requests;
create policy bookings_sales_update on public.booking_requests
  for update
  using (
    public.is_admin()
    or (
      public.current_app_role() = 'sales'
      and assigned_sales_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or (
      public.current_app_role() = 'sales'
      and assigned_sales_id = auth.uid()
    )
  );

drop policy if exists sales_notes_staff on public.sales_notes;
drop policy if exists sales_notes_staff_read on public.sales_notes;
drop policy if exists sales_notes_assigned_insert on public.sales_notes;

create policy sales_notes_staff_read on public.sales_notes
  for select using (public.is_sales());

create policy sales_notes_assigned_insert on public.sales_notes
  for insert with check (
    public.is_admin()
    or exists (
      select 1
      from public.booking_requests b
      where b.id = booking_request_id
        and b.assigned_sales_id = auth.uid()
        and public.current_app_role() = 'sales'
    )
  );

create or replace function public.sales_add_booking_note(
  p_booking_id uuid,
  p_content text,
  p_note_type text default 'general'
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
  v_note sales_notes%rowtype;
begin
  select role into v_role from public.profiles where id = v_actor_id;
  if v_role is null or v_role not in ('sales', 'admin') then
    raise exception 'Bạn không có quyền cập nhật booking này';
  end if;

  select * into v_booking
  from public.booking_requests
  where id = p_booking_id
  for update;

  if not found then
    raise exception 'Không tìm thấy booking';
  end if;

  if v_role = 'sales' and v_booking.assigned_sales_id is distinct from v_actor_id then
    raise exception 'Booking chưa được phân công cho bạn';
  end if;

  if char_length(btrim(coalesce(p_content, ''))) < 3
     or char_length(btrim(coalesce(p_content, ''))) > 2000 then
    raise exception 'Ghi chú cần từ 3 đến 2.000 ký tự';
  end if;

  if p_note_type is null or p_note_type not in (
    'contact_attempt',
    'customer_preference',
    'price_discussion',
    'partner_confirmation',
    'risk_warning',
    'follow_up',
    'general'
  ) then
    raise exception 'Loại ghi chú không hợp lệ';
  end if;

  insert into public.sales_notes (
    booking_request_id,
    author_id,
    content,
    note_type
  )
  values (
    p_booking_id,
    v_actor_id,
    btrim(p_content),
    p_note_type
  )
  returning * into v_note;

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    after
  )
  values (
    v_actor_id,
    'booking.note_added',
    'booking_request',
    p_booking_id,
    jsonb_build_object(
      'note_id', v_note.id,
      'note_type', v_note.note_type
    )
  );

  return jsonb_build_object(
    'id', v_note.id,
    'note_type', v_note.note_type,
    'created_at', v_note.created_at
  );
end;
$$;

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
begin
  select role into v_role from public.profiles where id = v_actor_id;
  if v_role is null or v_role not in ('sales', 'admin') then
    raise exception 'Bạn không có quyền cập nhật booking này';
  end if;

  select * into v_booking
  from public.booking_requests
  where id = p_booking_id
  for update;

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
  elsif v_booking.status in ('new', 'contacted', 'checking_availability')
        and p_to_status = 'cancelled' then
    v_allowed := true;
    v_note_type := 'risk_warning';
  end if;

  if not v_allowed then
    raise exception 'Chuyển trạng thái không hợp lệ từ % sang %',
      v_booking.status, p_to_status;
  end if;

  insert into public.sales_notes (
    booking_request_id,
    author_id,
    content,
    note_type
  )
  values (
    p_booking_id,
    v_actor_id,
    btrim(p_note),
    v_note_type
  )
  returning * into v_note;

  update public.booking_requests
  set status = p_to_status
  where id = p_booking_id;

  insert into public.booking_status_logs (
    booking_request_id,
    from_status,
    to_status,
    changed_by,
    note
  )
  values (
    p_booking_id,
    v_booking.status,
    p_to_status,
    v_actor_id,
    btrim(p_note)
  );

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    before,
    after
  )
  values (
    v_actor_id,
    'booking.status_changed',
    'booking_request',
    p_booking_id,
    jsonb_build_object('status', v_booking.status),
    jsonb_build_object(
      'status', p_to_status,
      'note_id', v_note.id
    )
  );

  return jsonb_build_object(
    'id', p_booking_id,
    'from_status', v_booking.status,
    'status', p_to_status,
    'note_id', v_note.id
  );
end;
$$;

revoke all on function public.sales_add_booking_note(uuid, text, text) from public;
revoke all on function public.sales_transition_booking(uuid, booking_status, text) from public;
grant execute on function public.sales_add_booking_note(uuid, text, text) to authenticated;
grant execute on function public.sales_transition_booking(uuid, booking_status, text) to authenticated;
