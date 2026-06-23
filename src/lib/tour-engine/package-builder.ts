import type { TravelProduct, TripRequest, PackageTier, ItineraryDay, SlotTime } from "@/types";
import { PACKAGE_TIERS, PACKAGE_TIER_LABELS, TRAVEL_STYLE_LABELS } from "@/lib/constants";
import { formatVND } from "@/lib/utils";
import { lineTotalFor, emptyBreakdown, addToBreakdown, type PricingContext } from "./pricing";
import { packageFitScore, productRelevance } from "./scoring";
import type { GroupedProducts } from "./filter";
import type { BuiltPackage, PricedItem } from "./types";

/** Lựa chọn dịch vụ cho một gói (dùng chung cho dựng mới và chỉnh tour). */
export interface Selection {
  transport: TravelProduct | null;
  hotel: TravelProduct | null;
  activities: TravelProduct[];
  restaurants: TravelProduct[];
}

/** Điểm chọn sản phẩm theo tier: budget ưu tiên rẻ, premium ưu tiên cao cấp. */
function tierScore(p: TravelProduct, trip: TripRequest, tier: PackageTier, maxPrice: number): number {
  const rel = productRelevance(p.tags, p.suitable_for, trip);
  const priceNorm = maxPrice > 0 ? p.price / maxPrice : 0;
  const qNorm = p.quality_score / 5;
  const premium = p.tags.includes("premium") ? 1 : 0;
  const budgetTag = p.tags.includes("budget") ? 1 : 0;

  if (tier === "budget") return rel * 0.4 + (1 - priceNorm) * 0.5 + budgetTag * 0.1;
  if (tier === "premium") return rel * 0.35 + qNorm * 0.4 + premium * 0.25;
  return rel * 0.55 + qNorm * 0.25 + (1 - priceNorm) * 0.2; // balanced
}

function pickTop(list: TravelProduct[], trip: TripRequest, tier: PackageTier, n: number): TravelProduct[] {
  if (!list.length || n <= 0) return [];
  const maxPrice = Math.max(...list.map((p) => p.price));
  return [...list]
    .sort((a, b) => tierScore(b, trip, tier, maxPrice) - tierScore(a, trip, tier, maxPrice))
    .slice(0, n);
}

function activityCount(numDays: number, style: string | null): number {
  const perDay = style === "active" ? 2 : style === "relaxing" ? 1.2 : 1.6;
  return Math.max(2, Math.round(perDay * numDays));
}

function mealCount(numDays: number): number {
  return Math.max(1, Math.round(1.3 * numDays));
}

const SLOT_ORDER: Record<SlotTime, number> = { morning: 0, afternoon: 1, evening: 2 };

export function pricingContext(trip: TripRequest): PricingContext {
  return {
    num_people: trip.num_people,
    num_nights: Math.max(1, trip.num_nights || trip.num_days - 1),
    num_rooms: Math.max(1, Math.ceil(trip.num_people / 2)),
  };
}

/** Phân bổ sản phẩm vào ngày/slot + tạo itinerary template (Phase 6 LLM viết lại). */
function buildItineraryAndItems(
  sel: Selection,
  trip: TripRequest,
  ctx: PricingContext,
): { items: PricedItem[]; itinerary: ItineraryDay[] } {
  const days = Math.max(1, trip.num_days);
  const nights = Math.max(1, trip.num_nights || days - 1);
  const itinerary: ItineraryDay[] = Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    title: `Ngày ${i + 1}`,
    slots: [],
  }));
  const items: PricedItem[] = [];
  let sort = 0;

  const addItem = (product: TravelProduct, day: number, slot: SlotTime) => {
    const { quantity, unit_price, line_total } = lineTotalFor(product, ctx);
    items.push({ product, day_number: day, slot, quantity, unit_price, line_total, sort_order: sort++ });
  };

  if (sel.transport) {
    addItem(sel.transport, 1, "morning");
    itinerary[0].slots.push({
      time: "morning",
      product_id: sel.transport.id,
      description: `Khởi hành từ Hà Nội đi Ninh Bình — ${sel.transport.name}`,
    });
  }

  if (sel.hotel) {
    addItem(sel.hotel, 1, "evening");
    for (let d = 1; d <= Math.min(nights, days); d++) {
      itinerary[d - 1].slots.push({
        time: "evening",
        product_id: sel.hotel.id,
        description: d === 1 ? `Nhận phòng & nghỉ tại ${sel.hotel.name}` : `Nghỉ tại ${sel.hotel.name}`,
      });
    }
  }

  sel.activities.forEach((a, i) => {
    const day = (i % days) + 1;
    const slot: SlotTime = i % 2 === 0 ? "morning" : "afternoon";
    addItem(a, day, slot);
    itinerary[day - 1].slots.push({
      time: slot,
      product_id: a.id,
      description: `Tham quan & trải nghiệm ${a.name}`,
    });
  });

  sel.restaurants.forEach((r, i) => {
    const day = (i % days) + 1;
    addItem(r, day, "evening");
    itinerary[day - 1].slots.push({
      time: "evening",
      product_id: r.id,
      description: `Ẩm thực: ${r.name}`,
    });
  });

  for (const d of itinerary) d.slots.sort((a, b) => SLOT_ORDER[a.time] - SLOT_ORDER[b.time]);
  return { items, itinerary };
}

function tierName(tier: PackageTier, trip: TripRequest): string {
  const span = `${trip.num_days}N${trip.num_nights}Đ`;
  if (tier === "budget") return `Ninh Bình Tiết Kiệm ${span}`;
  if (tier === "premium") return `Ninh Bình Trải Nghiệm ${span}`;
  return `Ninh Bình Cân Bằng ${span}`;
}

function tierReason(tier: PackageTier, trip: TripRequest, total: number): string {
  const styleLabel = trip.travel_style
    ? (TRAVEL_STYLE_LABELS[trip.travel_style as keyof typeof TRAVEL_STYLE_LABELS] ?? trip.travel_style)
    : "phù hợp";
  const blurb =
    tier === "budget"
      ? "tối ưu chi phí mà vẫn giữ các trải nghiệm chính."
      : tier === "premium"
        ? "ưu tiên nghỉ dưỡng và dịch vụ cao cấp."
        : "cân bằng giữa chi phí và trải nghiệm.";
  return `Gói ${PACKAGE_TIER_LABELS[tier]} cho ${trip.num_people} khách, phong cách ${styleLabel} — tổng dự kiến ${formatVND(total)}, ${blurb}`;
}

/** Lắp 1 gói hoàn chỉnh từ Selection (giá + fit + itinerary template). */
export function assemblePackage(
  tier: PackageTier,
  sel: Selection,
  trip: TripRequest,
): BuiltPackage | null {
  const ctx = pricingContext(trip);
  const { items, itinerary } = buildItineraryAndItems(sel, trip, ctx);
  if (items.length === 0) return null;

  const breakdown = emptyBreakdown();
  for (const it of items) addToBreakdown(breakdown, it.product.type, it.line_total);

  return {
    tier,
    name: tierName(tier, trip),
    total_price: breakdown.total,
    fit_score: packageFitScore(items, trip, breakdown.total),
    recommendation_reason: tierReason(tier, trip, breakdown.total),
    itinerary,
    cost_breakdown: breakdown,
    conditions: [
      "Giá là dự kiến — cần admin/sales xác nhận",
      "Tùy tình trạng chỗ thực tế khi đặt",
    ],
    items,
  };
}

/** Dựng 3 gói (budget / balanced / premium) từ kho dịch vụ đã lọc. */
export function buildThreePackages(trip: TripRequest, grouped: GroupedProducts): BuiltPackage[] {
  const packages: BuiltPackage[] = [];
  for (const tier of PACKAGE_TIERS) {
    const sel: Selection = {
      transport: pickTop(grouped.transport, trip, tier, 1)[0] ?? null,
      hotel: pickTop(grouped.hotel, trip, tier, 1)[0] ?? null,
      activities: pickTop(grouped.activity, trip, tier, activityCount(trip.num_days, trip.travel_style)),
      restaurants: pickTop(grouped.restaurant, trip, tier, mealCount(trip.num_days)),
    };
    const pkg = assemblePackage(tier, sel, trip);
    if (pkg) packages.push(pkg);
  }
  return packages;
}
