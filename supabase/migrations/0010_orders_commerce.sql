-- Orders / Demo Commerce
-- Buyer tạo order từ giỏ dịch vụ → thanh toán demo → Sales xử lý trạng thái.
-- Nối tiếp 0009. Dùng bảng orders/order_items/order_status_logs/payments (0004) + next_order_code (0004).
-- Chạy trên Supabase SQL Editor (1 lần Run).

-- ── 1. Buyer tạo order từ giỏ ───────────────────────────────
create or replace function public.buyer_create_order_from_cart(p_note text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_code text;
  v_order_id uuid;
  v_total integer := 0;
  v_count int;
begin
  if v_user is null then
    raise exception 'Chưa đăng nhập';
  end if;

  select count(*) into v_count from public.cart_items where user_id = v_user;
  if v_count = 0 then
    raise exception 'Giỏ dịch vụ đang trống';
  end if;

  -- Chặn thêm dịch vụ đã hết chỗ vào đơn.
  if exists (
    select 1 from public.cart_items c
    join public.products p on p.id = c.product_id
    where c.user_id = v_user and p.availability_status = 'sold_out'
  ) then
    raise exception 'Có dịch vụ trong giỏ đã hết chỗ — hãy bỏ ra trước khi đặt';
  end if;

  v_code := public.next_order_code();

  insert into public.orders (code, user_id, status, payment_status, total_price, note_from_buyer)
  values (
    v_code, v_user, 'pending_confirmation', 'unpaid', 0,
    nullif(btrim(coalesce(p_note, '')), '')
  )
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, quantity, unit_price, line_total)
  select v_order_id, c.product_id, c.quantity, p.price, p.price * c.quantity
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user;

  select coalesce(sum(line_total), 0) into v_total
  from public.order_items where order_id = v_order_id;
  update public.orders set total_price = v_total where id = v_order_id;

  delete from public.cart_items where user_id = v_user;

  insert into public.order_status_logs (order_id, from_status, to_status, changed_by, note)
  values (v_order_id, null, 'pending_confirmation', v_user, 'Khách tạo đơn từ giỏ dịch vụ');

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, after)
  values (
    v_user, 'order.created', 'order', v_order_id,
    jsonb_build_object('code', v_code, 'total', v_total)
  );

  return jsonb_build_object('id', v_order_id, 'code', v_code);
end;
$$;

-- ── 2. Buyer thanh toán demo ────────────────────────────────
create or replace function public.buyer_pay_order_demo(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_order orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Không tìm thấy đơn';
  end if;
  if v_order.user_id <> v_user then
    raise exception 'Bạn không có quyền với đơn này';
  end if;
  if v_order.status <> 'awaiting_payment' then
    raise exception 'Đơn chưa ở bước chờ thanh toán';
  end if;

  update public.orders
  set status = 'paid', payment_status = 'paid_demo'
  where id = p_order_id;

  insert into public.payments (order_id, amount, method, status, paid_at)
  values (p_order_id, v_order.total_price, 'demo', 'paid', now());

  insert into public.order_status_logs (order_id, from_status, to_status, changed_by, note)
  values (p_order_id, 'awaiting_payment', 'paid', v_user, 'Khách thanh toán (demo)');

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, after)
  values (
    v_user, 'order.paid_demo', 'order', p_order_id,
    jsonb_build_object('amount', v_order.total_price)
  );

  return jsonb_build_object('id', p_order_id, 'status', 'paid');
end;
$$;

-- ── 3. Sales chuyển trạng thái order ────────────────────────
create or replace function public.sales_transition_order(
  p_order_id uuid,
  p_to_status order_status,
  p_note text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_role user_role;
  v_order orders%rowtype;
  v_allowed boolean := false;
begin
  select role into v_role from public.profiles where id = v_actor;
  if v_role is null or v_role not in ('sales', 'admin') then
    raise exception 'Bạn không có quyền xử lý đơn';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Không tìm thấy đơn';
  end if;

  if char_length(btrim(coalesce(p_note, ''))) < 5
     or char_length(btrim(coalesce(p_note, ''))) > 2000 then
    raise exception 'Vui lòng ghi rõ kết quả/lý do (5–2.000 ký tự)';
  end if;

  if v_order.status = 'pending_confirmation' and p_to_status in ('awaiting_payment', 'cancelled') then
    v_allowed := true;
  elsif v_order.status = 'awaiting_payment' and p_to_status = 'cancelled' then
    v_allowed := true;
  elsif v_order.status = 'paid' and p_to_status in ('processing', 'refund_requested') then
    v_allowed := true;
  elsif v_order.status = 'processing' and p_to_status in ('confirmed', 'cancelled') then
    v_allowed := true;
  elsif v_order.status = 'confirmed' and p_to_status = 'completed' then
    v_allowed := true;
  elsif v_order.status = 'refund_requested' and p_to_status = 'refunded' then
    v_allowed := true;
  end if;

  if not v_allowed then
    raise exception 'Chuyển trạng thái không hợp lệ từ % sang %', v_order.status, p_to_status;
  end if;

  update public.orders
  set status = p_to_status,
      payment_status = case when p_to_status = 'refunded' then 'refunded' else payment_status end,
      assigned_sales_id = coalesce(assigned_sales_id, v_actor)
  where id = p_order_id;

  insert into public.order_status_logs (order_id, from_status, to_status, changed_by, note)
  values (p_order_id, v_order.status, p_to_status, v_actor, btrim(p_note));

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, before, after)
  values (
    v_actor, 'order.status_changed', 'order', p_order_id,
    jsonb_build_object('status', v_order.status),
    jsonb_build_object('status', p_to_status)
  );

  return jsonb_build_object('id', p_order_id, 'from_status', v_order.status, 'status', p_to_status);
end;
$$;

-- ── 4. Quyền thực thi ────────────────────────────────────────
revoke all on function public.buyer_create_order_from_cart(text) from public;
revoke all on function public.buyer_pay_order_demo(uuid) from public;
revoke all on function public.sales_transition_order(uuid, order_status, text) from public;
grant execute on function public.buyer_create_order_from_cart(text) to authenticated;
grant execute on function public.buyer_pay_order_demo(uuid) to authenticated;
grant execute on function public.sales_transition_order(uuid, order_status, text) to authenticated;
