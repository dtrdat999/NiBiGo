import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BookingRequest } from "@/types";

const bodySchema = z.object({
  reason: z.string().max(300).optional().default(""),
});

const CANCELLABLE_STATUSES = ["new", "contacted", "checking_availability"] as const;

export async function POST(
  request: Request,
  { params }: { params: { bookingId: string } },
) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Lý do hủy không hợp lệ" }, { status: 400 });
  }

  const { data: bookingData } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("id", params.bookingId)
    .single();
  if (!bookingData) {
    return NextResponse.json({ error: "Không tìm thấy yêu cầu" }, { status: 404 });
  }

  const booking = bookingData as BookingRequest;
  if (booking.user_id !== user!.id) {
    return NextResponse.json({ error: "Bạn không thể hủy yêu cầu này" }, { status: 403 });
  }
  if (!CANCELLABLE_STATUSES.includes(booking.status as (typeof CANCELLABLE_STATUSES)[number])) {
    return NextResponse.json(
      {
        error:
          "Yêu cầu đã sang bước xác nhận tiếp theo. Vui lòng liên hệ tư vấn viên nếu cần thay đổi.",
      },
      { status: 409 },
    );
  }

  const admin = createAdminClient();
  const { data: cancelledBooking, error } = await admin
    .from("booking_requests")
    .update({ status: "cancelled" })
    .eq("id", booking.id)
    .eq("status", booking.status)
    .select("id")
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: "Chưa thể hủy yêu cầu" }, { status: 500 });
  }
  if (!cancelledBooking) {
    return NextResponse.json(
      {
        error:
          "Trạng thái yêu cầu vừa được cập nhật. Hãy tải lại trang để xem thông tin mới nhất.",
      },
      { status: 409 },
    );
  }

  await admin.from("booking_status_logs").insert({
    booking_request_id: booking.id,
    from_status: booking.status,
    to_status: "cancelled",
    changed_by: user!.id,
    note: parsed.data.reason
      ? `Khách hủy yêu cầu: ${parsed.data.reason}`
      : "Khách chủ động hủy yêu cầu",
  });

  await admin
    .from("tour_packages")
    .update({ is_selected: false })
    .eq("id", booking.tour_package_id);

  return NextResponse.json({ data: { status: "cancelled" } });
}
