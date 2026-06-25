import { NextResponse } from "next/server";
import { requireSales } from "@/lib/api-helpers";
import { salesStatusTransitionSchema } from "@/lib/validation/sales-booking";
import type { BookingRequest, BookingStatus } from "@/types";

const ALLOWED_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus[]>> = {
  new: ["contacted", "cancelled"],
  contacted: ["checking_availability", "cancelled"],
  checking_availability: ["waiting_payment", "cancelled"],
};

export async function POST(
  request: Request,
  { params }: { params: { bookingId: string } },
) {
  const { supabase, user, profile, response } = await requireSales();
  if (response) return response;

  const parsed = salesStatusTransitionSchema.safeParse(
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
  if (
    profile?.role === "sales" &&
    booking.assigned_sales_id !== user!.id
  ) {
    return NextResponse.json(
      {
        error: booking.assigned_sales_id
          ? "Booking đang do Sales khác phụ trách"
          : "Hãy nhận xử lý booking trước khi cập nhật trạng thái",
      },
      { status: 409 },
    );
  }

  const allowed = ALLOWED_TRANSITIONS[booking.status] ?? [];
  if (!allowed.includes(parsed.data.toStatus)) {
    return NextResponse.json(
      {
        error:
          "Trạng thái booking vừa thay đổi hoặc hành động này chưa đủ điều kiện.",
      },
      { status: 409 },
    );
  }

  const { data, error } = await supabase.rpc("sales_transition_booking", {
    p_booking_id: booking.id,
    p_to_status: parsed.data.toStatus,
    p_note: parsed.data.note,
  });

  if (error) {
    return NextResponse.json(
      {
        error: error.message.includes("sales_transition_booking")
          ? "Chưa thể cập nhật. Hãy kiểm tra migration Sales mới nhất."
          : error.message,
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ data });
}
