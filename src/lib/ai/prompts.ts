import type { BuiltPackage } from "@/lib/tour-engine/types";
import type { TravelProduct, TripRequest } from "@/types";
import { TRAVEL_STYLE_LABELS, INTEREST_OPTIONS, PACKAGE_TIER_LABELS } from "@/lib/constants";
import { formatVND } from "@/lib/utils";

export const NIBI_SYSTEM = `Bạn là NiBi AI — trợ lý lập kế hoạch & tư vấn du lịch Ninh Bình của NiBiGo AI Travel Platform.
QUY TẮC BẮT BUỘC:
- Chỉ dùng các sản phẩm trong DANH SÁCH được cung cấp; tham chiếu bằng đúng "product_id".
- TUYỆT ĐỐI không bịa sản phẩm, không bịa giá, không bịa tình trạng chỗ.
- KHÔNG tự tính hay khẳng định tổng giá; tổng giá do hệ thống tính.
- Văn phong tiếng Việt, ấm áp, gọn, đúng trọng tâm, hợp du lịch nghỉ dưỡng.
- Mô tả trải nghiệm hấp dẫn nhưng KHÔNG nêu con số tiền.
Trả về DUY NHẤT một JSON hợp lệ theo schema yêu cầu, không kèm bất kỳ chữ nào ngoài JSON.`;

/** Prompt gộp cả 3 gói trong 1 lần gọi (tiết kiệm token). */
export function buildEnrichmentPrompt(
  packages: BuiltPackage[],
  trip: TripRequest,
  ragContext: string,
): string {
  const styleLabel = trip.travel_style
    ? (TRAVEL_STYLE_LABELS[trip.travel_style as keyof typeof TRAVEL_STYLE_LABELS] ??
      trip.travel_style)
    : "không nêu";
  const interestLabels =
    trip.interests
      .map((v) => INTEREST_OPTIONS.find((o) => o.value === v)?.label ?? v)
      .join(", ") || "không nêu";
  const g = trip.group_composition ?? { adults: 0, children: 0, elderly: 0 };

  const pkgBlocks = packages
    .map((pkg) => {
      const lines = pkg.items
        .map(
          (it) =>
            `  - product_id=${it.product.id} | ${it.product.name} | loại=${it.product.type} | ngày ${it.day_number ?? "-"} buổi ${it.slot ?? "-"} | tags=${it.product.tags.join("/")}`,
        )
        .join("\n");
      return `Gói tier="${pkg.tier}" (${PACKAGE_TIER_LABELS[pkg.tier]}), ${pkg.items.length} dịch vụ:\n${lines}`;
    })
    .join("\n\n");

  return `NHU CẦU KHÁCH:
- Điểm đến: Ninh Bình
- Thời gian: ${trip.num_days} ngày ${trip.num_nights} đêm
- Số người: ${trip.num_people} (người lớn ${g.adults ?? 0}, trẻ em ${g.children ?? 0}, người lớn tuổi ${g.elderly ?? 0})
- Phong cách: ${styleLabel}
- Sở thích: ${interestLabels}
- Yêu cầu đặc biệt: ${trip.special_requests || "không"}

THÔNG TIN THAM KHẢO NỘI BỘ (chỉ dựa vào đây, không bịa thêm):
${ragContext || "(không có)"}

CÁC GÓI CẦN VIẾT LỜI (GIỮ NGUYÊN sản phẩm, chỉ viết tên/lý do/lịch trình):
${pkgBlocks}

YÊU CẦU: với MỖI gói ở trên, tạo một object gồm:
- "tier": đúng tier của gói
- "name": tên gói hấp dẫn, có chữ "Ninh Bình" và số ngày
- "recommendation_reason": 1–2 câu vì sao gói hợp với khách (bám nhu cầu trên)
- "conditions": mảng 1–2 điều kiện cần admin/sales xác nhận
- "itinerary": mảng theo ngày; mỗi ngày { "day": số, "title": tiêu đề gợi cảm xúc, "slots": [ { "time": "morning|afternoon|evening", "product_id": CHỈ dùng product_id thuộc đúng gói đó, "description": mô tả trải nghiệm hấp dẫn KHÔNG nêu giá } ] }

CHỈ trả JSON đúng dạng: { "packages": [ {...}, {...}, {...} ] }`;
}

// ── Chỉnh tour (parse phản hồi tự nhiên → thao tác) ──────────
export const REVISE_SYSTEM = `Bạn là NiBi AI. Nhiệm vụ: diễn giải phản hồi của khách thành các THAO TÁC chỉnh tour có cấu trúc.
QUY TẮC:
- Chỉ tham chiếu "product_id" có trong DANH SÁCH gói hiện tại.
- Các op cho phép: remove(product_id) · add_like(tags, avoid_tags?, product_type?) · replace(product_id, tags) · set_intensity(level: lighter|heavier) · adjust_budget(direction: down|up).
- "bỏ/không thích X" → remove. "thêm hoạt động nhẹ/cho trẻ em" → add_like. "lịch nhẹ hơn/đỡ mệt" → set_intensity lighter. "giảm/tăng ngân sách" → adjust_budget.
Chỉ trả JSON: { "intent_summary": "...", "operations": [ ... ] }`;

export function buildRevisionPrompt(products: TravelProduct[], feedback: string): string {
  const list = products
    .map((p) => `  - product_id=${p.id} | ${p.name} | loại=${p.type} | tags=${p.tags.join("/")}`)
    .join("\n");
  return `GÓI HIỆN TẠI gồm các dịch vụ:
${list}

PHẢN HỒI CỦA KHÁCH: "${feedback}"

Hãy diễn giải thành thao tác. Chỉ trả JSON: { "intent_summary": "...", "operations": [ ... ] }`;
}

// ── AI sales note (cho admin/sales) ──────────────────────────
export const SALES_NOTE_SYSTEM = `Bạn là NiBi AI, viết GHI CHÚ LEAD ngắn gọn (2–4 câu) cho đội sales NiBiGo.
Tập trung: nhu cầu chính của khách, điểm cần lưu ý, gợi ý hành động chốt. Văn phong nghiệp vụ, tiếng Việt. KHÔNG nêu lại toàn bộ lịch trình. KHÔNG bịa số liệu.`;

export function buildSalesNotePrompt(trip: TripRequest, pkg: BuiltPackage | { name: string; total_price: number }): string {
  const styleLabel = trip.travel_style
    ? (TRAVEL_STYLE_LABELS[trip.travel_style as keyof typeof TRAVEL_STYLE_LABELS] ?? trip.travel_style)
    : "không nêu";
  const interestLabels =
    trip.interests.map((v) => INTEREST_OPTIONS.find((o) => o.value === v)?.label ?? v).join(", ") ||
    "không nêu";
  return `Khách đặt gói "${pkg.name}", tổng dự kiến ${formatVND(pkg.total_price)}.
NHU CẦU: ${trip.num_people} khách, ${trip.num_days} ngày ${trip.num_nights} đêm, ngân sách ${formatVND(trip.budget)}, phong cách ${styleLabel}, sở thích: ${interestLabels}. Yêu cầu đặc biệt: ${trip.special_requests || "không"}.
Viết ghi chú lead 2–4 câu cho sales.`;
}
