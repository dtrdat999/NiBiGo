import { NextResponse } from "next/server";
import { requireSales } from "@/lib/api-helpers";
import { addSalesNoteSchema } from "@/lib/validation/sales-booking";
import type { BookingRequest } from "@/types";

export async function POST(
  request: Request,
  { params }: { params: { bookingId: string } },
) {
  const { supabase, user, profile, response } = await requireSales();
  if (response) return response;

  const parsed = addSalesNoteSchema.safeParse(
    await request.json().catch(() => ({})),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ghi chú không hợp lệ" },
      { status: 400 },
    );
  }

  const { data: bookingData } = await supabase
    .from("booking_requests")
    .select("id, assigned_sales_id")
    .eq("id", params.bookingId)
    .single();

  if (!bookingData) {
    return NextResponse.json({ error: "Không tìm thấy booking" }, { status: 404 });
  }

  const booking = bookingData as Pick<
    BookingRequest,
    "id" | "assigned_sales_id"
  >;
  if (
    profile?.role === "sales" &&
    booking.assigned_sales_id !== user!.id
  ) {
    return NextResponse.json(
      {
        error: booking.assigned_sales_id
          ? "Booking đang do Sales khác phụ trách"
          : "Hãy nhận xử lý booking trước khi thêm ghi chú",
      },
      { status: 409 },
    );
  }

  const { data, error } = await supabase.rpc("sales_add_booking_note", {
    p_booking_id: booking.id,
    p_content: parsed.data.content,
    p_note_type: parsed.data.noteType,
  });

  if (error) {
    return NextResponse.json(
      {
        error: error.message.includes("sales_add_booking_note")
          ? "Chưa thể lưu ghi chú. Hãy kiểm tra migration Sales mới nhất."
          : error.message,
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ data });
}
