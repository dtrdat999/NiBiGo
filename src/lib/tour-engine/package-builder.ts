import type {
  ItineraryDay,
  PackageTier,
  SlotTime,
  TravelProduct,
  TripRequest,
} from "@/types";
import {
  PACKAGE_TIER_LABELS,
  PACKAGE_TIERS,
  TRAVEL_STYLE_LABELS,
} from "@/lib/constants";
import { compareItinerarySlots, normalizeItineraryDays } from "@/lib/itinerary/structure";
import { formatVND } from "@/lib/utils";
import type { GroupedProducts } from "./filter";
import { emptyBreakdown, addToBreakdown, lineTotalFor, type PricingContext } from "./pricing";
import { packageFitScore, productRelevance } from "./scoring";
import type { BuiltPackage, PricedItem } from "./types";

/** Lựa chọn dịch vụ cho một gói, dùng chung cho dựng mới và chỉnh tour. */
export interface Selection {
  transport: TravelProduct | null;
  hotel: TravelProduct | null;
  activities: TravelProduct[];
  restaurants: TravelProduct[];
}

function tierScore(
  product: TravelProduct,
  trip: TripRequest,
  tier: PackageTier,
  maxPrice: number,
) {
  const relevance = productRelevance(product.tags, product.suitable_for, trip);
  const priceNorm = maxPrice > 0 ? product.price / maxPrice : 0;
  const qualityNorm = product.quality_score / 5;
  const premium = product.tags.includes("premium") ? 1 : 0;
  const budgetTag = product.tags.includes("budget") ? 1 : 0;

  if (tier === "budget") return relevance * 0.4 + (1 - priceNorm) * 0.5 + budgetTag * 0.1;
  if (tier === "premium") return relevance * 0.35 + qualityNorm * 0.4 + premium * 0.25;

  return relevance * 0.55 + qualityNorm * 0.25 + (1 - priceNorm) * 0.2;
}

function pickTop(
  list: TravelProduct[],
  trip: TripRequest,
  tier: PackageTier,
  count: number,
) {
  if (!list.length || count <= 0) return [];

  const maxPrice = Math.max(...list.map((product) => product.price));
  return [...list]
    .sort((a, b) => tierScore(b, trip, tier, maxPrice) - tierScore(a, trip, tier, maxPrice))
    .slice(0, count);
}

function activityCount(numDays: number, style: string | null) {
  const perDay = style === "active" ? 2 : style === "relaxing" ? 1.2 : 1.6;
  return Math.max(2, Math.round(perDay * numDays));
}

function mealCount(numDays: number) {
  return Math.max(1, Math.round(1.3 * numDays));
}

export function pricingContext(trip: TripRequest): PricingContext {
  return {
    num_people: trip.num_people,
    num_nights: Math.max(1, trip.num_nights || trip.num_days - 1),
    num_rooms: Math.max(1, Math.ceil(trip.num_people / 2)),
  };
}

function buildItineraryAndItems(
  selection: Selection,
  trip: TripRequest,
  ctx: PricingContext,
): { items: PricedItem[]; itinerary: ItineraryDay[] } {
  const days = Math.max(1, trip.num_days);
  const nights = Math.max(1, trip.num_nights || days - 1);
  const itinerary: ItineraryDay[] = Array.from({ length: days }, (_, index) => ({
    day: index + 1,
    title: `Ngày ${index + 1}`,
    slots: [],
  }));
  const items: PricedItem[] = [];
  let sort = 0;

  const addItem = (product: TravelProduct, day: number, slot: SlotTime) => {
    const { quantity, unit_price, line_total } = lineTotalFor(product, ctx);
    items.push({
      product,
      day_number: day,
      slot,
      quantity,
      unit_price,
      line_total,
      sort_order: sort++,
    });
  };

  if (selection.transport) {
    addItem(selection.transport, 1, "morning");
    itinerary[0].slots.push({
      time: "morning",
      product_id: selection.transport.id,
      description: `Khởi hành đi Ninh Bình — ${selection.transport.name}`,
    });
  }

  if (selection.hotel) {
    addItem(selection.hotel, 1, "evening");
    for (let day = 1; day <= Math.min(nights, days); day++) {
      itinerary[day - 1].slots.push({
        time: "evening",
        product_id: selection.hotel.id,
        description:
          day === 1
            ? `Nhận phòng và nghỉ tại ${selection.hotel.name}`
            : `Nghỉ tại ${selection.hotel.name}`,
      });
    }
  }

  selection.activities.forEach((activity, index) => {
    const day = (index % days) + 1;
    const slot: SlotTime = index % 2 === 0 ? "morning" : "afternoon";
    addItem(activity, day, slot);
    itinerary[day - 1].slots.push({
      time: slot,
      product_id: activity.id,
      description: `Tham quan và trải nghiệm ${activity.name}`,
    });
  });

  selection.restaurants.forEach((restaurant, index) => {
    const day = (index % days) + 1;
    const slot: SlotTime = index % 2 === 0 ? "noon" : "evening";
    addItem(restaurant, day, slot);
    itinerary[day - 1].slots.push({
      time: slot,
      product_id: restaurant.id,
      description: slot === "noon" ? `Ăn trưa: ${restaurant.name}` : `Ăn tối: ${restaurant.name}`,
    });
  });

  for (const day of itinerary) {
    day.slots.sort(compareItinerarySlots);
  }

  return { items, itinerary: normalizeItineraryDays(itinerary, days) };
}

function tierName(tier: PackageTier, trip: TripRequest) {
  const span = `${trip.num_days}N${trip.num_nights}Đ`;
  if (tier === "budget") return `Ninh Bình Tiết Kiệm ${span}`;
  if (tier === "premium") return `Ninh Bình Trải Nghiệm ${span}`;
  return `Ninh Bình Cân Bằng ${span}`;
}

function tierReason(tier: PackageTier, trip: TripRequest, total: number) {
  const styleLabel = trip.travel_style
    ? (TRAVEL_STYLE_LABELS[trip.travel_style as keyof typeof TRAVEL_STYLE_LABELS] ??
      trip.travel_style)
    : "phù hợp";
  const blurb =
    tier === "budget"
      ? "tối ưu chi phí nhưng vẫn giữ các trải nghiệm chính."
      : tier === "premium"
        ? "ưu tiên trải nghiệm đẹp và dịch vụ tốt hơn."
        : "cân bằng giữa chi phí, nhịp đi và trải nghiệm.";

  return `Gói ${PACKAGE_TIER_LABELS[tier]} cho ${trip.num_people} khách, phong cách ${styleLabel} — tổng dự kiến ${formatVND(total)}, ${blurb}`;
}

export function assemblePackage(
  tier: PackageTier,
  selection: Selection,
  trip: TripRequest,
): BuiltPackage | null {
  const ctx = pricingContext(trip);
  const { items, itinerary } = buildItineraryAndItems(selection, trip, ctx);
  if (items.length === 0) return null;

  const breakdown = emptyBreakdown();
  for (const item of items) {
    addToBreakdown(breakdown, item.product.type, item.line_total);
  }

  return {
    tier,
    name: tierName(tier, trip),
    total_price: breakdown.total,
    fit_score: packageFitScore(items, trip, breakdown.total),
    recommendation_reason: tierReason(tier, trip, breakdown.total),
    itinerary,
    cost_breakdown: breakdown,
    conditions: [
      "Chi phí đang là dự kiến và sẽ được kiểm tra lại trước khi bạn quyết định đặt",
      "Tình trạng còn chỗ có thể thay đổi theo thời điểm gửi yêu cầu",
    ],
    items,
  };
}

export function buildThreePackages(trip: TripRequest, grouped: GroupedProducts): BuiltPackage[] {
  const packages: BuiltPackage[] = [];

  for (const tier of PACKAGE_TIERS) {
    const selection: Selection = {
      transport: pickTop(grouped.transport, trip, tier, 1)[0] ?? null,
      hotel: pickTop(grouped.hotel, trip, tier, 1)[0] ?? null,
      activities: pickTop(
        grouped.activity,
        trip,
        tier,
        activityCount(trip.num_days, trip.travel_style),
      ),
      restaurants: pickTop(grouped.restaurant, trip, tier, mealCount(trip.num_days)),
    };

    const pkg = assemblePackage(tier, selection, trip);
    if (pkg) packages.push(pkg);
  }

  return packages;
}
