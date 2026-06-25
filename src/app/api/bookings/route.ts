import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { bookingSchema } from "@/lib/validation/booking";
import { generateSalesNote } from "@/lib/ai/sales-note";
import type { TripRequest, TourPackage } from "@/types";

/** POST /api/bookings — guest gửi yêu cầu đặt tour (mock, lưu DB + mã + AI sales note). */
export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const parsed = bookingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const input = parsed.data;

  // Tải gói (RLS đảm bảo đúng chủ) + trip.
  const { data: pkgData } = await supabase
    .from("tour_packages")
    .select("*")
    .eq("id", input.tourPackageId)
    .single();
  if (!pkgData) return NextResponse.json({ error: "Không tìm thấy gói tour" }, { status: 404 });
  const pkg = pkgData as TourPackage;

  const { data: tripData } = await supabase
    .from("trip_requests")
    .select("*")
    .eq("id", pkg.trip_request_id)
    .single();
  if (!tripData) return NextResponse.json({ error: "Không tìm thấy yêu cầu" }, { status: 404 });
  const trip = tripData as TripRequest;

  const admin = createAdminClient();

  // Mã booking NBG-YYYY-NNNN (hàm DB; fallback nếu lỗi).
  let code: string;
  const { data: codeData } = await admin.rpc("next_booking_code");
  if (typeof codeData === "string" && codeData) {
    code = codeData;
  } else {
    code = `NBG-${new Date().getFullYear()}-${String(Date.now() % 10000).padStart(4, "0")}`;
  }

  const aiSalesNote = await generateSalesNote(trip, { name: pkg.name, total_price: pkg.total_price });
  const contactChannelLabels = {
    phone: "Điện thoại",
    zalo: "Zalo",
    email: "Email",
  } as const;
  const guestNotes = [
    `Kênh liên hệ ưu tiên: ${contactChannelLabels[input.preferred_contact_channel]}`,
    input.special_request ? `Yêu cầu đặc biệt: ${input.special_request}` : null,
    input.note ? `Ghi chú thêm: ${input.note}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const { data: booking, error } = await admin
    .from("booking_requests")
    .insert({
      code,
      user_id: user!.id,
      trip_request_id: trip.id,
      tour_package_id: pkg.id,
      contact_name: input.contact_name,
      contact_phone: input.contact_phone,
      contact_email: input.contact_email || null,
      note_from_guest: guestNotes || null,
      total_price: pkg.total_price,
      ai_sales_note: aiSalesNote,
      status: "new",
    })
    .select("id, code")
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: error?.message ?? "Không tạo được yêu cầu" }, { status: 500 });
  }

  // Ghi lịch sử trạng thái khởi tạo + đánh dấu gói được chọn + cập nhật trip.
  await admin.from("booking_status_logs").insert({
    booking_request_id: booking.id,
    to_status: "new",
    changed_by: user!.id,
    note: "Khách gửi yêu cầu",
  });
  await admin.from("tour_packages").update({ is_selected: true }).eq("id", pkg.id);
  await admin.from("trip_requests").update({ status: "submitted" }).eq("id", trip.id);

  return NextResponse.json({ data: { code: booking.code } }, { status: 201 });
}
