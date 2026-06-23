import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { filterAndGroup } from "@/lib/tour-engine/filter";
import { assemblePackage, type Selection } from "@/lib/tour-engine/package-builder";
import { applyRevision } from "@/lib/tour-engine/apply-revision";
import { parseRevision } from "@/lib/ai/revise";
import { enrichPackagesWithAI } from "@/lib/ai/itinerary";
import type { TravelProduct, TripRequest, TourPackage } from "@/types";

const bodySchema = z.object({
  packageId: z.string().uuid(),
  feedback: z.string().min(2, "Hãy nhập yêu cầu chỉnh tour").max(500),
});

/** POST /api/tours/revise — chỉnh 1 gói bằng ngôn ngữ tự nhiên, tính lại giá. */
export async function POST(request: Request) {
  const { supabase, response } = await requireUser();
  if (response) return response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ" }, { status: 400 });
  }
  const { packageId, feedback } = parsed.data;

  // Tải gói (RLS đảm bảo đúng chủ) + trip.
  const { data: pkgData } = await supabase
    .from("tour_packages")
    .select("*")
    .eq("id", packageId)
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

  // Sản phẩm hiện tại trong gói (lấy đủ kể cả đã đổi trạng thái).
  const { data: itemRows } = await admin
    .from("tour_package_items")
    .select("products(*)")
    .eq("tour_package_id", packageId);
  const currentProducts = ((itemRows ?? []) as unknown as { products: TravelProduct }[])
    .map((r) => r.products)
    .filter(Boolean);

  const currentSel: Selection = {
    transport: currentProducts.find((p) => p.type === "transport") ?? null,
    hotel: currentProducts.find((p) => p.type === "hotel") ?? null,
    activities: currentProducts.filter((p) => p.type === "activity"),
    restaurants: currentProducts.filter((p) => p.type === "restaurant"),
  };

  // LLM diễn giải phản hồi → thao tác.
  const revision = await parseRevision(currentProducts, feedback);
  if (!revision || revision.operations.length === 0) {
    return NextResponse.json(
      { error: "Chưa hiểu yêu cầu. Hãy thử diễn đạt cụ thể hơn (vd: bỏ Hang Múa, thêm hoạt động nhẹ)." },
      { status: 422 },
    );
  }

  // Kho dịch vụ khả dụng để tìm thay thế.
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("destination_id", trip.destination_id)
    .eq("is_active", true)
    .eq("status", "published")
    .neq("availability_status", "sold_out");
  const grouped = filterAndGroup((products ?? []) as TravelProduct[]);

  const newSel = applyRevision(currentSel, revision, trip, grouped);
  const rebuilt = assemblePackage(pkg.tier, newSel, trip);
  if (!rebuilt) {
    return NextResponse.json({ error: "Sau khi chỉnh, gói không còn dịch vụ hợp lệ." }, { status: 400 });
  }

  // LLM viết lại itinerary; giá GIỮ NGUYÊN từ engine.
  const { data: docs } = await supabase
    .from("knowledge_documents")
    .select("title, content")
    .eq("is_active", true)
    .limit(8);
  const ragContext = (docs ?? [])
    .map((d: { title: string; content: string }) => `- ${d.title}: ${d.content}`)
    .join("\n");
  const [enriched] = await enrichPackagesWithAI([rebuilt], trip, ragContext);

  // Cập nhật gói + items.
  await admin
    .from("tour_packages")
    .update({
      name: enriched.name,
      total_price: enriched.total_price,
      fit_score: enriched.fit_score,
      recommendation_reason: enriched.recommendation_reason,
      itinerary: enriched.itinerary,
      cost_breakdown: enriched.cost_breakdown,
      conditions: enriched.conditions,
      revision_count: (pkg.revision_count ?? 0) + 1,
    })
    .eq("id", packageId);

  await admin.from("tour_package_items").delete().eq("tour_package_id", packageId);
  const rows = enriched.items.map((it) => ({
    tour_package_id: packageId,
    product_id: it.product.id,
    day_number: it.day_number,
    slot: it.slot,
    quantity: it.quantity,
    unit_price: it.unit_price,
    line_total: it.line_total,
    sort_order: it.sort_order,
  }));
  await admin.from("tour_package_items").insert(rows);

  await admin.from("trip_requests").update({ status: "revised" }).eq("id", trip.id);

  return NextResponse.json({
    data: { total_price: enriched.total_price, intent_summary: revision.intent_summary },
  });
}
