import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { filterAndGroup } from "@/lib/tour-engine/filter";
import { buildThreePackages } from "@/lib/tour-engine/package-builder";
import { enrichPackagesWithAI } from "@/lib/ai/itinerary";
import type { TravelProduct, TripRequest } from "@/types";

const bodySchema = z.object({ tripRequestId: z.string().uuid() });

/** POST /api/tours/generate — dựng 3 gói tour cho 1 trip request, lưu DB. */
export async function POST(request: Request) {
  const { supabase, response } = await requireUser();
  if (response) return response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Thiếu tripRequestId hợp lệ" }, { status: 400 });
  }

  // Tải trip qua client có session (RLS đảm bảo đúng chủ sở hữu).
  const { data: tripData } = await supabase
    .from("trip_requests")
    .select("*")
    .eq("id", parsed.data.tripRequestId)
    .single();
  if (!tripData) {
    return NextResponse.json({ error: "Không tìm thấy yêu cầu chuyến đi" }, { status: 404 });
  }
  const trip = tripData as TripRequest;

  // Kho dịch vụ khả dụng cho điểm đến.
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("destination_id", trip.destination_id)
    .eq("is_active", true)
    .eq("status", "published")
    .neq("availability_status", "sold_out");

  const grouped = filterAndGroup((products ?? []) as TravelProduct[]);
  const builtPackages = buildThreePackages(trip, grouped);
  if (builtPackages.length === 0) {
    return NextResponse.json(
      { error: "Chưa đủ dịch vụ để dựng tour. Hãy thêm dịch vụ ở trang quản lý." },
      { status: 400 },
    );
  }

  // RAG: lấy tri thức nội bộ (chính sách/lưu ý) để LLM bám, không bịa.
  // MVP: dùng các knowledge docs active (số lượng nhỏ). Vector search có thể thêm sau.
  const { data: docs } = await supabase
    .from("knowledge_documents")
    .select("title, content")
    .eq("is_active", true)
    .limit(8);
  const ragContext = (docs ?? [])
    .map((d: { title: string; content: string }) => `- ${d.title}: ${d.content}`)
    .join("\n");

  // LLM viết name/lý do/itinerary; giá GIỮ NGUYÊN từ engine. Lỗi → fallback template.
  const packages = await enrichPackagesWithAI(builtPackages, trip, ragContext);

  // Ghi gói + items qua service role (bỏ qua RLS một cách có kiểm soát).
  const admin = createAdminClient();
  await admin.from("tour_packages").delete().eq("trip_request_id", trip.id);

  for (const pkg of packages) {
    const { data: inserted, error: pkgErr } = await admin
      .from("tour_packages")
      .insert({
        trip_request_id: trip.id,
        tier: pkg.tier,
        name: pkg.name,
        total_price: pkg.total_price,
        fit_score: pkg.fit_score,
        recommendation_reason: pkg.recommendation_reason,
        itinerary: pkg.itinerary,
        cost_breakdown: pkg.cost_breakdown,
        conditions: pkg.conditions,
      })
      .select("id")
      .single();

    if (pkgErr || !inserted) {
      return NextResponse.json({ error: pkgErr?.message ?? "Lỗi lưu gói tour" }, { status: 500 });
    }

    const rows = pkg.items.map((it) => ({
      tour_package_id: inserted.id,
      product_id: it.product.id,
      day_number: it.day_number,
      slot: it.slot,
      quantity: it.quantity,
      unit_price: it.unit_price,
      line_total: it.line_total,
      sort_order: it.sort_order,
    }));
    const { error: itemsErr } = await admin.from("tour_package_items").insert(rows);
    if (itemsErr) {
      return NextResponse.json({ error: itemsErr.message }, { status: 500 });
    }
  }

  await admin.from("trip_requests").update({ status: "generated" }).eq("id", trip.id);

  return NextResponse.json({ data: { count: packages.length } }, { status: 201 });
}
