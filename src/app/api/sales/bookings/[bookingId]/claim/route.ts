import { NextResponse } from "next/server";
import { requireSales } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BookingRequest } from "@/types";

export async function POST(
  _request: Request,
  { params }: { params: { bookingId: string } },
) {
  const { supabase, user, profile, response } = await requireSales();
  if (response) return response;

  if (profile?.role !== "sales") {
    return NextResponse.json(
      { error: "Admin có thể phân công booking ở khu quản trị" },
      { status: 403 },
    );
  }

  const { data: bookingData } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("id", params.bookingId)
    .single();
  if (!bookingData) {
    return NextResponse.json({ error: "Không tìm thấy booking" }, { status: 404 });
  }

  const booking = bookingData as BookingRequest;
  if (booking.assigned_sales_id === user!.id) {
    return NextResponse.json({ data: { assigned_sales_id: user!.id } });
  }
  if (booking.assigned_sales_id) {
    return NextResponse.json(
      { error: "Booking đã có người phụ trách" },
      { status: 409 },
    );
  }
  if (["completed", "cancelled"].includes(booking.status)) {
    return NextResponse.json(
      { error: "Booking này không còn cần nhận xử lý" },
      { status: 409 },
    );
  }

  const admin = createAdminClient();
  const { data: updated, error } = await admin
    .from("booking_requests")
    .update({ assigned_sales_id: user!.id })
    .eq("id", booking.id)
    .is("assigned_sales_id", null)
    .select("id, assigned_sales_id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Chưa thể nhận booking" }, { status: 500 });
  }
  if (!updated) {
    return NextResponse.json(
      { error: "Booking vừa được người khác nhận xử lý" },
      { status: 409 },
    );
  }

  await admin.from("audit_logs").insert({
    actor_id: user!.id,
    action: "booking.claim",
    entity_type: "booking_request",
    entity_id: booking.id,
    before: { assigned_sales_id: null },
    after: { assigned_sales_id: user!.id },
  });

  return NextResponse.json({ data: updated });
}
