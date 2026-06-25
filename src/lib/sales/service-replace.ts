import type { AvailabilityCheckCategory, ProductType } from "@/types";

/**
 * Các loại sản phẩm cùng "nhóm engine" có thể thay thế cho nhau.
 * Lưu trú gộp hotel + homestay (xem lib/tour-engine/filter.ts groupKey).
 */
export function groupTypesFor(type: ProductType): ProductType[] {
  if (type === "hotel" || type === "homestay") return ["hotel", "homestay"];
  return [type];
}

/** Nhóm Availability Checklist tương ứng loại sản phẩm (null nếu không map — vd combo). */
export function availabilityCategoryFor(
  type: ProductType,
): AvailabilityCheckCategory | null {
  switch (type) {
    case "hotel":
    case "homestay":
      return "accommodation";
    case "transport":
      return "transport";
    case "activity":
      return "activity";
    case "restaurant":
      return "restaurant";
    default:
      return null; // combo
  }
}
