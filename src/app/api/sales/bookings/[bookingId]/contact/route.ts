import { NextResponse } from "next/server";
import { requireSales } from "@/lib/api-helpers";
import { salesContactSchema } from "@/lib/validation/sales-booking";
import type { BookingRequest } from "@/types";

export async function POST(
  request: Request,
  { params }: { params: { bookingId: string } },
) {
  const { supabase, user, profile, response } = await requireSales();
  if (response) return response;

  const parsed = salesContactSchema.safeParse(
    await request.json().catch(() => ({})),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 },
    );
  }
  const input = parsed.data;

  // create_followup / set_contact_status thao tác trực tiếp trên booking → kiểm tra phụ trách.
  if (input.action === "create_followup" || input.action === "set_contact_status") {
    const { data: bookingData } = await supabase
      .from("booking_requests")
      .select("id, assigned_sales_id")
      .eq("id", params.bookingId)
      .single();
    if (!bookingData) {
      return NextResponse.json({ error: "Không tìm thấy booking" }, { status: 404 });
    }
    const booking = bookingData as Pick<BookingRequest, "id" | "assigned_sales_id">;
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
  }

  let result;
  if (input.action === "create_followup") {
    result = await supabase.rpc("sales_create_followup", {
      p_booking_id: params.bookingId,
      p_due_at: input.dueAt,
      p_content: input.content,
      p_type: input.followUpType,
    });
  } else if (input.action === "set_contact_status") {
    result = await supabase.rpc("sales_set_contact_status", {
      p_booking_id: params.bookingId,
      p_status: input.status,
      p_note: input.note ?? null,
    });
  } else if (input.action === "complete_followup") {
    // RPC tự kiểm tra follow-up thuộc booking nào & quyền phụ trách.
    result = await supabase.rpc("sales_complete_followup", {
      p_followup_id: input.followupId,
      p_result_note: input.resultNote,
    });
  } else {
    result = await supabase.rpc("sales_cancel_followup", {
      p_followup_id: input.followupId,
      p_reason: input.reason ?? null,
    });
  }

  if (result.error) {
    const message = result.error.message.includes("function")
      ? "Chưa thể cập nhật. Hãy kiểm tra migration Sales mới nhất (0009)."
      : result.error.message;
    return NextResponse.json({ error: message }, { status: 409 });
  }

  return NextResponse.json({ data: result.data });
}
