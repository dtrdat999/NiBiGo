import type { TravelProduct, CostBreakdown, ProductType } from "@/types";

/**
 * NGUỒN SỰ THẬT về giá. LLM không bao giờ tính ở đây.
 * line_total = unit_price * multiplier(price_unit).
 */
export interface PricingContext {
  num_people: number;
  num_nights: number;
  num_rooms: number;
}

export function priceMultiplier(priceUnit: string, ctx: PricingContext): number {
  switch (priceUnit) {
    case "per_person":
      return ctx.num_people;
    case "per_night":
      return ctx.num_nights * ctx.num_rooms;
    case "per_group":
    case "per_trip":
    default:
      return 1;
  }
}

export function lineTotalFor(
  product: TravelProduct,
  ctx: PricingContext,
): { quantity: number; unit_price: number; line_total: number } {
  const quantity = priceMultiplier(product.price_unit, ctx);
  return { quantity, unit_price: product.price, line_total: product.price * quantity };
}

export function emptyBreakdown(): CostBreakdown {
  return { hotel: 0, activity: 0, restaurant: 0, transport: 0, other: 0, total: 0 };
}

export function addToBreakdown(b: CostBreakdown, type: ProductType, amount: number): void {
  if (type === "hotel" || type === "homestay") b.hotel += amount;
  else if (type === "activity") b.activity += amount;
  else if (type === "restaurant") b.restaurant += amount;
  else if (type === "transport") b.transport += amount;
  else b.other += amount; // combo / khác
  b.total += amount;
}
