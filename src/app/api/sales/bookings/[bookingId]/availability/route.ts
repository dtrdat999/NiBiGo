import { NextResponse } from "next/server";
import { requireSales } from "@/lib/api-helpers";
import { salesAvailabilitySchema } from "@/lib/validation/sales-booking";
import type { BookingRequest } from "@/types";

export async function POST(
  request: Request,
  { params }: { params: { bookingId: string } },
) {
  const { supabase, user, profile, response } = await requireSales();
  if (response) return response;

  const parsed = salesAvailabilitySchema.safeParse(
    await request.json().catch(() => ({})),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 },
    );
  }

  const { data: bookingData } = await supabase
    .from("booking_requests")
    .select("id, status, assigned_sales_id")
    .eq("id", params.bookingId)
    .single();

  if (!bookingData) {
    return NextResponse.json({ error: "Không tìm thấy booking" }, { status: 404 });
  }
  const booking = bookingData as Pick<
    BookingRequest,
    "id" | "status" | "assigned_sales_id"
  >;

  if (profile?.role === "sales" && booking.assigned_sales_id !== user!.id) {
    return NextResponse.json(
      {
        error: booking.assigned_sales_id
          ? "Booking đang do Sales khác phụ trách"
          : "Hãy nhận xử lý booking trước khi cập nhật",
      },
      { status: 409 },
    );
  }

  if (booking.status !== "checking_availability") {
    return NextResponse.json(
      { error: "Chỉ cập nhật được khi booking đang ở bước kiểm tra dịch vụ." },
      { status: 409 },
    );
  }

  const input = parsed.data;
  let result;

  if (input.action === "update_service") {
    result = await supabase.rpc("sales_update_availability", {
      p_booking_id: booking.id,
      p_category: input.category,
      p_status: input.status,
      p_note: input.note ?? null,
    });
  } else if (input.action === "set_final_price") {
    result = await supabase.rpc("sales_confirm_final_price", {
      p_booking_id: booking.id,
      p_final_price: input.finalPrice,
      p_note: input.note,
    });
  } else {
    result = await supabase.rpc("sales_set_customer_agreement", {
      p_booking_id: booking.id,
      p_agreed: input.agreed,
    });
  }

  if (result.error) {
    const message = result.error.message.includes("function")
      ? "Chưa thể cập nhật. Hãy kiểm tra migration Sales mới nhất (0008)."
      : result.error.message;
    return NextResponse.json({ error: message }, { status: 409 });
  }

  return NextResponse.json({ data: result.data });
}
