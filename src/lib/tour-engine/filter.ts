import type { TravelProduct, ProductType } from "@/types";

export interface GroupedProducts {
  hotel: TravelProduct[];
  activity: TravelProduct[];
  restaurant: TravelProduct[];
  transport: TravelProduct[];
  combo: TravelProduct[];
}

/**
 * Map loại sản phẩm → nhóm engine. 'homestay' coi như lưu trú (gộp vào 'hotel')
 * để AI packager dùng được; xem DATA_SCHEMA.md (engine bucket).
 */
export function groupKey(type: ProductType): keyof GroupedProducts {
  return type === "homestay" ? "hotel" : type;
}

/**
 * Lọc sản phẩm hợp lệ và nhóm theo loại.
 * Loại bỏ: không active, hết chỗ (sold_out). Giữ 'limited' (vẫn gợi ý được).
 * (Việc lọc theo destination đã làm ở truy vấn.)
 */
export function filterAndGroup(products: TravelProduct[]): GroupedProducts {
  const grouped: GroupedProducts = {
    hotel: [],
    activity: [],
    restaurant: [],
    transport: [],
    combo: [],
  };
  for (const p of products) {
    if (!p.is_active) continue;
    if (p.availability_status === "sold_out") continue;
    grouped[groupKey(p.type)].push(p);
  }
  return grouped;
}
