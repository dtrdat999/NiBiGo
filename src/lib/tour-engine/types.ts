import type {
  TravelProduct,
  PackageTier,
  CostBreakdown,
  ItineraryDay,
  SlotTime,
} from "@/types";

/** Một dòng dịch vụ trong gói — chuẩn hóa để tính giá (khớp tour_package_items). */
export interface PricedItem {
  product: TravelProduct;
  day_number: number | null;
  slot: SlotTime | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  sort_order: number;
}

/** Gói tour do engine dựng (trước khi LLM viết lời ở Phase 6). */
export interface BuiltPackage {
  tier: PackageTier;
  name: string;
  total_price: number;
  fit_score: number;
  recommendation_reason: string;
  itinerary: ItineraryDay[];
  cost_breakdown: CostBreakdown;
  conditions: string[];
  items: PricedItem[];
}
