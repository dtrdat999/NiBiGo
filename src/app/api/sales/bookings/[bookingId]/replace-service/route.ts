import { NextResponse } from "next/server";
import { requireSales } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { replaceServiceSchema } from "@/lib/validation/sales-booking";
import { pricingContext } from "@/lib/tour-engine/package-builder";
import { lineTotalFor, emptyBreakdown, addToBreakdown } from "@/lib/tour-engine/pricing";
import { groupTypesFor, availabilityCategoryFor } from "@/lib/sales/service-replace";
import type { BookingRequest, TravelProduct, TripRequest } from "@/types";

type ItemRow = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export async function POST(
  request: Request,
  { params }: { params: { bookingId: string } },
) {
  const { supabase, user, profile, response } = await requireSales();
  if (response) return response;

  const parsed = replaceServiceSchema.safeParse(
    await request.json().catch(() => ({})),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 },
    );
  }
  const { itemId, newProductId, reason } = parsed.data;

  // 1. Booking + quyền + trạng thái
  const { data: bookingData } = await supabase
    .from("booking_requests")
    .select("id, status, assigned_sales_id, trip_request_id, tour_package_id")
    .eq("id", params.bookingId)
    .single();
  if (!bookingData) {
    return NextResponse.json({ error: "Không tìm thấy booking" }, { status: 404 });
  }
  const booking = bookingData as Pick<
    BookingRequest,
    "id" | "status" | "assigned_sales_id" | "trip_request_id" | "tour_package_id"
  >;
  if (profile?.role === "sales" && booking.assigned_sales_id !== user!.id) {
    return NextResponse.json(
      { error: "Booking chưa được phân công cho bạn" },
      { status: 409 },
    );
  }
  if (booking.status !== "checking_availability") {
    return NextResponse.json(
      { error: "Chỉ thay thế dịch vụ khi booking đang ở bước kiểm tra dịch vụ." },
      { status: 409 },
    );
  }

  // 2. Trip (ngữ cảnh tính giá)
  const { data: tripData } = await supabase
    .from("trip_requests")
    .select("*")
    .eq("id", booking.trip_request_id)
    .single();
  if (!tripData) {
    return NextResponse.json({ error: "Không tải được nhu cầu chuyến đi" }, { status: 404 });
  }
  const trip = tripData as TripRequest;

  // 3. Items + products + sản phẩm mới
  const { data: itemData } = await supabase
    .from("tour_package_items")
    .select("id, product_id, quantity, unit_price, line_total")
    .eq("tour_package_id", booking.tour_package_id);
  const items = (itemData as ItemRow[] | null) ?? [];
  const target = items.find((item) => item.id === itemId);
  if (!target) {
    return NextResponse.json({ error: "Không tìm thấy dịch vụ trong gói" }, { status: 404 });
  }

  const productIds = Array.from(
    new Set([...items.map((item) => item.product_id), newProductId]),
  );
  const { data: productData } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds);
  const products = (productData as TravelProduct[] | null) ?? [];
  const productById = new Map(products.map((product) => [product.id, product]));

  const currentProduct = productById.get(target.product_id);
  const newProduct = productById.get(newProductId);
  if (!newProduct) {
    return NextResponse.json({ error: "Không tìm thấy dịch vụ thay thế" }, { status: 404 });
  }
  if (newProduct.availability_status === "sold_out" || !newProduct.is_active) {
    return NextResponse.json({ error: "Dịch vụ thay thế không khả dụng" }, { status: 409 });
  }
  if (
    currentProduct &&
    !groupTypesFor(currentProduct.type).includes(newProduct.type)
  ) {
    return NextResponse.json(
      { error: "Dịch vụ thay thế phải cùng nhóm với dịch vụ hiện tại." },
      { status: 409 },
    );
  }

  // 4. Tính lại giá
  const ctx = pricingContext(trip);
  const swapped = lineTotalFor(newProduct, ctx);

  const breakdown = emptyBreakdown();
  let total = 0;
  for (const item of items) {
    const isTarget = item.id === itemId;
    const product = isTarget ? newProduct : productById.get(item.product_id);
    const lineTotal = isTarget ? swapped.line_total : item.line_total;
    if (product) addToBreakdown(breakdown, product.type, lineTotal);
    else breakdown.total += lineTotal; // sản phẩm thiếu dữ liệu → gộp tổng
    total += lineTotal;
  }

  // 5. Ghi DB qua service role (đã kiểm quyền + trạng thái ở trên)
  const admin = createAdminClient();

  const { error: itemError } = await admin
    .from("tour_package_items")
    .update({
      product_id: newProductId,
      unit_price: swapped.unit_price,
      line_total: swapped.line_total,
    })
    .eq("id", itemId);
  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 500 });
  }

  const { data: pkgRow } = await admin
    .from("tour_packages")
    .select("revision_count")
    .eq("id", booking.tour_package_id)
    .single();
  await admin
    .from("tour_packages")
    .update({
      total_price: total,
      cost_breakdown: breakdown,
      revision_count: ((pkgRow?.revision_count as number | undefined) ?? 0) + 1,
    })
    .eq("id", booking.tour_package_id);

  // Giá đổi → giá cuối & sự đồng ý phải xác nhận lại.
  await admin
    .from("booking_requests")
    .update({
      total_price: total,
      final_price: null,
      final_price_confirmed_at: null,
      customer_agreed: false,
    })
    .eq("id", booking.id);

  const category = availabilityCategoryFor(newProduct.type);
  if (category) {
    await admin
      .from("booking_availability_checks")
      .upsert(
        {
          booking_request_id: booking.id,
          category,
          status: "replaced",
          note: `Đã thay bằng ${newProduct.name}`,
          updated_by: user!.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "booking_request_id,category" },
      );
  }

  await admin.from("sales_notes").insert({
    booking_request_id: booking.id,
    author_id: user!.id,
    content: `Thay dịch vụ "${currentProduct?.name ?? target.product_id}" → "${newProduct.name}". Lý do: ${reason}`,
    note_type: "partner_confirmation",
  });

  await admin.from("audit_logs").insert({
    actor_id: user!.id,
    action: "booking.service_replaced",
    entity_type: "booking_request",
    entity_id: booking.id,
    before: { product_id: target.product_id, total_price: target.line_total },
    after: { product_id: newProductId, total_price: total },
  });

  return NextResponse.json({ data: { total_price: total } });
}
