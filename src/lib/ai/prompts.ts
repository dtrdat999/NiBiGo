import type { BuiltPackage } from "@/lib/tour-engine/types";
import type { TravelProduct, TripRequest } from "@/types";
import {
  INTEREST_OPTIONS,
  PACKAGE_TIER_LABELS,
  TRAVEL_STYLE_LABELS,
} from "@/lib/constants";
import { formatVND } from "@/lib/utils";

export const NIBI_SYSTEM = `Bạn là NiBi AI — trợ lý lập kế hoạch và tư vấn du lịch Ninh Bình.

QUY TẮC BẮT BUỘC:
- Chỉ dùng các sản phẩm trong danh sách được cung cấp; tham chiếu bằng đúng "product_id".
- Tuyệt đối không bịa sản phẩm, không bịa giá, không bịa tình trạng còn chỗ.
- Không tự tính hoặc khẳng định tổng giá; tổng giá do hệ thống tính.
- Không nói "đã đặt thành công", "đặt phòng thành công", "giữ chỗ thành công" hoặc bất kỳ câu nào khiến khách hiểu rằng dịch vụ đã được đặt.
- Chỉ được nói ở mức: khách có thể gửi yêu cầu tư vấn; tư vấn viên sẽ kiểm tra lại dịch vụ, giá cuối và xác nhận trước khi đặt.
- Văn phong tiếng Việt ngắn gọn, ấm, rõ ràng, minh bạch, không ép mua.
- Mô tả trải nghiệm hữu ích nhưng không nêu con số tiền trong từng slot.

Trả về DUY NHẤT một JSON hợp lệ theo schema yêu cầu, không kèm bất kỳ chữ nào ngoài JSON.`;

/** Prompt gộp cả 3 gói trong 1 lần gọi để tiết kiệm token. */
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
      .map((value) => INTEREST_OPTIONS.find((option) => option.value === value)?.label ?? value)
      .join(", ") || "không nêu";
  const group = trip.group_composition ?? { adults: 0, children: 0, elderly: 0 };

  const packageBlocks = packages
    .map((pkg) => {
      const lines = pkg.items
        .map(
          (item) =>
            `  - product_id=${item.product.id} | ${item.product.name} | loại=${item.product.type} | ngày ${item.day_number ?? "-"} buổi ${item.slot ?? "-"} | tags=${item.product.tags.join("/")}`,
        )
        .join("\n");
      return `Gói tier="${pkg.tier}" (${PACKAGE_TIER_LABELS[pkg.tier]}), ${pkg.items.length} dịch vụ:\n${lines}`;
    })
    .join("\n\n");

  return `NHU CẦU KHÁCH:
- Điểm đến: Ninh Bình
- Thời gian: ${trip.num_days} ngày ${trip.num_nights} đêm
- Số người: ${trip.num_people} (người lớn ${group.adults ?? 0}, trẻ em ${group.children ?? 0}, người lớn tuổi ${group.elderly ?? 0})
- Phong cách: ${styleLabel}
- Sở thích: ${interestLabels}
- Yêu cầu đặc biệt: ${trip.special_requests || "không"}

THÔNG TIN THAM KHẢO NỘI BỘ:
${ragContext || "(không có)"}

CÁC GÓI CẦN VIẾT LỜI, GIỮ NGUYÊN SẢN PHẨM:
${packageBlocks}

YÊU CẦU VỚI MỖI GÓI:
- "tier": đúng tier của gói.
- "name": tên gói có "Ninh Bình" và số ngày.
- "recommendation_reason": 1–2 câu giải thích vì sao gói hợp với khách; ưu tiên cảm giác yên tâm, kiểm soát ngân sách, nhịp đi hợp lý.
- "conditions": 1–2 điều kiện cần tư vấn viên xác nhận lại. Không nói dịch vụ đã được đặt.
- "itinerary": mảng theo ngày. Mỗi ngày phải có đúng các khung chính:
  1. "morning" = buổi sáng
  2. "noon" = buổi trưa
  3. "afternoon" = buổi chiều
  4. "evening" = buổi tối
- Mỗi slot dùng dạng { "time": "morning|noon|afternoon|evening", "product_id": CHỈ dùng product_id thuộc đúng gói đó, "description": mô tả trải nghiệm ngắn, hữu ích, không nêu giá }.
- Nếu một buổi không có dịch vụ rõ ràng trong danh sách, hãy dùng dịch vụ phù hợp nhất đã có trong gói và mô tả như một mốc nghỉ/nghỉ trưa/di chuyển nhẹ. Không bịa thêm địa điểm hoặc nhà cung cấp.
- Không dùng các câu như "đã đặt thành công", "đã giữ chỗ", "phòng đã được xác nhận".

CHỈ trả JSON đúng dạng: { "packages": [ {...}, {...}, {...} ] }`;
}

export const REVISE_SYSTEM = `Bạn là NiBi AI. Nhiệm vụ: diễn giải phản hồi của khách thành các thao tác chỉnh tour có cấu trúc.

QUY TẮC:
- Chỉ tham chiếu "product_id" có trong danh sách gói hiện tại.
- Các op cho phép: remove(product_id) · add_like(tags, avoid_tags?, product_type?) · replace(product_id, tags) · set_intensity(level: lighter|heavier) · adjust_budget(direction: down|up).
- "bỏ/không thích X" → remove.
- "thêm hoạt động nhẹ/cho trẻ em" → add_like.
- "lịch nhẹ hơn/đỡ mệt" → set_intensity lighter.
- "giảm/tăng ngân sách" → adjust_budget.

Chỉ trả JSON: { "intent_summary": "...", "operations": [ ... ] }`;

export function buildRevisionPrompt(products: TravelProduct[], feedback: string): string {
  const list = products
    .map(
      (product) =>
        `  - product_id=${product.id} | ${product.name} | loại=${product.type} | tags=${product.tags.join("/")}`,
    )
    .join("\n");
  return `GÓI HIỆN TẠI gồm các dịch vụ:
${list}

PHẢN HỒI CỦA KHÁCH: "${feedback}"

Hãy diễn giải thành thao tác. Chỉ trả JSON: { "intent_summary": "...", "operations": [ ... ] }`;
}

export const SALES_NOTE_SYSTEM = `Bạn là NiBi AI, viết ghi chú lead ngắn gọn cho đội Sales.

QUY TẮC:
- Tập trung vào nhu cầu chính, điểm cần lưu ý và gợi ý hành động tiếp theo.
- Không nêu lại toàn bộ lịch trình.
- Không bịa số liệu, không nói dịch vụ đã được đặt/giữ chỗ thành công nếu Sales chưa xác nhận.
- Gợi ý Sales xác nhận lại dịch vụ, giá cuối, nhịp lịch trình và điều kiện cần báo cho khách.
- Văn phong nghiệp vụ, tiếng Việt, 2–4 câu.`;

export function buildSalesNotePrompt(
  trip: TripRequest,
  pkg: BuiltPackage | { name: string; total_price: number },
): string {
  const styleLabel = trip.travel_style
    ? (TRAVEL_STYLE_LABELS[trip.travel_style as keyof typeof TRAVEL_STYLE_LABELS] ??
      trip.travel_style)
    : "không nêu";
  const interestLabels =
    trip.interests
      .map((value) => INTEREST_OPTIONS.find((option) => option.value === value)?.label ?? value)
      .join(", ") || "không nêu";

  return `Khách chọn gói "${pkg.name}", tổng dự kiến ${formatVND(pkg.total_price)}.
NHU CẦU: ${trip.num_people} khách, ${trip.num_days} ngày ${trip.num_nights} đêm, ngân sách ${formatVND(trip.budget)}, phong cách ${styleLabel}, sở thích: ${interestLabels}. Yêu cầu đặc biệt: ${trip.special_requests || "không"}.

Viết ghi chú lead 2–4 câu cho Sales. Nhắc rõ đây là yêu cầu cần xác nhận, không phải dịch vụ đã được đặt.`;
}
