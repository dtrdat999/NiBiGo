import "server-only";
import { getAIProvider, isAIConfigured } from "./provider";
import { SALES_NOTE_SYSTEM, buildSalesNotePrompt } from "./prompts";
import { sanitizeBookingPolicyCopy } from "@/lib/product-policy";
import { formatVND } from "@/lib/utils";
import type { TripRequest } from "@/types";

/** Sinh AI sales note cho Sales/Admin. Lỗi hoặc thiếu key thì dùng ghi chú template an toàn. */
export async function generateSalesNote(
  trip: TripRequest,
  pkg: { name: string; total_price: number },
): Promise<string> {
  const fallback = `Khách ${trip.num_people} người, ${trip.num_days}N${trip.num_nights}Đ, ngân sách ${formatVND(trip.budget)}. Chọn gói "${pkg.name}" (${formatVND(pkg.total_price)}). Cần liên hệ xác nhận dịch vụ, lịch trình, giá cuối và điều kiện trước khi đặt.`;

  if (!isAIConfigured()) return fallback;

  try {
    const provider = getAIProvider();
    const text = await provider.generateText({
      system: SALES_NOTE_SYSTEM,
      user: buildSalesNotePrompt(trip, pkg),
      temperature: 0.5,
    });
    return sanitizeBookingPolicyCopy(text.trim()) || fallback;
  } catch (err) {
    console.error("[AI] sales note failed, using template:", err);
    return fallback;
  }
}
