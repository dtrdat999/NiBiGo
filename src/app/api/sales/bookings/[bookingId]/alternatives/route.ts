import { NextResponse } from "next/server";
import { requireSales } from "@/lib/api-helpers";
import { groupTypesFor } from "@/lib/sales/service-replace";
import type { BookingRequest, TravelProduct, TripRequest } from "@/types";

/** GET danh sách dịch vụ thay thế cùng nhóm cho một item trong gói. */
export async function GET(
  request: Request,
  { params }: { params: { bookingId: string } },
) {
  const { supabase, user, profile, response } = await requireSales();
  if (response) return response;

  const itemId = new URL(request.url).searchParams.get("itemId");
  if (!itemId) {
    return NextResponse.json({ error: "Thiếu itemId" }, { status: 400 });
  }

  const { data: bookingData } = await supabase
    .from("booking_requests")
    .select("id, trip_request_id, tour_package_id, assigned_sales_id")
    .eq("id", params.bookingId)
    .single();
  if (!bookingData) {
    return NextResponse.json({ error: "Không tìm thấy booking" }, { status: 404 });
  }
  const booking = bookingData as Pick<
    BookingRequest,
    "id" | "trip_request_id" | "tour_package_id" | "assigned_sales_id"
  >;
  if (profile?.role === "sales" && booking.assigned_sales_id !== user!.id) {
    return NextResponse.json(
      { error: "Booking chưa được phân công cho bạn" },
      { status: 409 },
    );
  }

  const { data: itemData } = await supabase
    .from("tour_package_items")
    .select("id, product_id, tour_package_id")
    .eq("id", itemId)
    .single();
  if (!itemData || itemData.tour_package_id !== booking.tour_package_id) {
    return NextResponse.json({ error: "Không tìm thấy dịch vụ trong gói" }, { status: 404 });
  }

  const { data: currentProduct } = await supabase
    .from("products")
    .select("*")
    .eq("id", itemData.product_id)
    .single();
  if (!currentProduct) {
    return NextResponse.json({ error: "Không tải được dịch vụ hiện tại" }, { status: 404 });
  }
  const current = currentProduct as TravelProduct;

  const { data: tripData } = await supabase
    .from("trip_requests")
    .select("destination_id")
    .eq("id", booking.trip_request_id)
    .single();
  const trip = tripData as Pick<TripRequest, "destination_id"> | null;

  let queryBuilder = supabase
    .from("products")
    .select("id, name, type, price, price_unit, availability_status, tags")
    .in("type", groupTypesFor(current.type))
    .eq("is_active", true)
    .eq("status", "published")
    .neq("availability_status", "sold_out")
    .neq("id", current.id);
  if (trip?.destination_id) {
    queryBuilder = queryBuilder.eq("destination_id", trip.destination_id);
  }

  const { data: candidates } = await queryBuilder.limit(30);
  const list = ((candidates as Pick<
    TravelProduct,
    "id" | "name" | "type" | "price" | "price_unit" | "availability_status" | "tags"
  >[] | null) ?? [])
    .map((product) => ({
      ...product,
      // điểm gần giá hiện tại + trùng tag → ưu tiên
      priceGap: Math.abs(product.price - current.price),
      tagOverlap: product.tags.filter((tag) => current.tags.includes(tag)).length,
    }))
    .sort((a, b) => b.tagOverlap - a.tagOverlap || a.priceGap - b.priceGap)
    .slice(0, 8);

  return NextResponse.json({
    data: {
      current: { id: current.id, name: current.name, price: current.price },
      alternatives: list,
    },
  });
}
