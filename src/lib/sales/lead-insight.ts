import type { BookingRequest, TourPackage, TripRequest } from "@/types";
import {
  INTEREST_OPTIONS,
  PACKAGE_TIER_LABELS,
  TRAVEL_STYLE_LABELS,
} from "@/lib/constants";
import { formatVND } from "@/lib/utils";

/**
 * Phân tích lead bằng LUẬT (deterministic) — không gọi LLM.
 * Đúng guardrail §9.6: chỉ tóm tắt nhu cầu, cảnh báo rủi ro, gợi ý cách tư vấn;
 * KHÔNG tự xác nhận booking, cam kết giá hay đổi trạng thái.
 */

export type RiskSeverity = "high" | "medium";
export type LeadRiskFlag = { id: string; label: string; severity: RiskSeverity };

export type LeadInsight = {
  summary: string;
  budgetFit: { label: string; tone: "green" | "gold" | "red" };
  buyingIntent: { label: string; tone: "green" | "gold" | "neutral" | "red" };
  riskFlags: LeadRiskFlag[];
  talkingPoints: string[];
  nextBestAction: string;
  upsell: string[];
};

function daysUntil(date: string | null, now: Date): number | null {
  if (!date) return null;
  const target = new Date(`${date}T00:00:00+07:00`);
  const today = new Date(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(now) +
      "T00:00:00+07:00",
  );
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

const NEXT_ACTION: Record<BookingRequest["status"], string> = {
  new: "Gọi khách để xác nhận nhu cầu và mức quan tâm.",
  contacted: "Bắt đầu kiểm tra dịch vụ và tình trạng còn chỗ.",
  checking_availability: "Hoàn tất checklist dịch vụ và chốt giá cuối.",
  waiting_payment: "Theo dõi thanh toán và giữ liên hệ với khách.",
  confirmed: "Chuẩn bị thông tin trước ngày khởi hành.",
  completed: "Chuyến đi đã hoàn tất — có thể chăm sóc sau bán.",
  cancelled: "Booking đã hủy — ghi nhận lý do để rút kinh nghiệm.",
};

export function buildLeadInsight({
  booking,
  trip,
  pkg,
  hasAvailabilityRisk,
  now = new Date(),
}: {
  booking: BookingRequest;
  trip?: TripRequest;
  pkg?: TourPackage;
  hasAvailabilityRisk: boolean;
  now?: Date;
}): LeadInsight {
  const days = daysUntil(trip?.start_date ?? null, now);
  const group = trip?.group_composition;
  const hasKidsOrElderly = Boolean((group?.children ?? 0) > 0 || (group?.elderly ?? 0) > 0);
  const refined = (pkg?.revision_count ?? 0) > 0;
  const ratio = pkg && trip && trip.budget > 0 ? pkg.total_price / trip.budget : 1;

  // ── Risk flags (§9.4) ──
  const riskFlags: LeadRiskFlag[] = [];
  if (ratio > 1.1) {
    riskFlags.push({ id: "budget", label: "Gói vượt ngân sách khách đặt ra", severity: "high" });
  }
  if (days !== null && days <= 5) {
    riskFlags.push({
      id: "date",
      label: days < 0 ? "Ngày khởi hành đã qua" : `Ngày đi rất gần (còn ${days} ngày)`,
      severity: "high",
    });
  }
  if (hasAvailabilityRisk) {
    riskFlags.push({ id: "availability", label: "Có dịch vụ cần xác nhận chỗ", severity: "high" });
  }
  if (trip?.special_requests?.trim()) {
    riskFlags.push({
      id: "special",
      label: "Có yêu cầu đặc biệt cần xác nhận",
      severity: "medium",
    });
  }
  if (hasKidsOrElderly) {
    riskFlags.push({
      id: "group",
      label: "Đoàn có trẻ em / người lớn tuổi",
      severity: "medium",
    });
  }
  if (refined) {
    riskFlags.push({
      id: "refined",
      label: "Lịch trình đã chỉnh — xác nhận lại giá & kỳ vọng",
      severity: "medium",
    });
  }

  // ── Budget fit ──
  const budgetFit: LeadInsight["budgetFit"] =
    ratio > 1.1
      ? { label: "Vượt ngân sách", tone: "red" }
      : ratio > 1.0
        ? { label: "Sát ngân sách", tone: "gold" }
        : { label: "Trong ngân sách", tone: "green" };

  // ── Buying intent (heuristic) ──
  let buyingIntent: LeadInsight["buyingIntent"];
  if (booking.status === "cancelled") {
    buyingIntent = { label: "Đã dừng", tone: "red" };
  } else if (booking.status === "confirmed" || booking.status === "waiting_payment") {
    buyingIntent = { label: "Cao", tone: "green" };
  } else if (
    booking.status === "checking_availability" ||
    booking.status === "contacted" ||
    refined
  ) {
    buyingIntent = { label: "Đang cân nhắc", tone: "gold" };
  } else {
    buyingIntent = { label: "Cần đánh giá", tone: "neutral" };
  }

  // ── Summary ──
  const styleLabel = trip?.travel_style
    ? TRAVEL_STYLE_LABELS[trip.travel_style as keyof typeof TRAVEL_STYLE_LABELS] ??
      trip.travel_style
    : "chưa rõ phong cách";
  const summary =
    booking.ai_sales_note?.trim() ||
    (trip
      ? `Khách ${trip.num_people} người, ${trip.num_days}N${trip.num_nights}Đ, ngân sách ${formatVND(
          trip.budget,
        )}, ${styleLabel}. Gói đề xuất: ${pkg?.name ?? "chưa rõ"}.`
      : "Chưa đủ dữ liệu để tóm tắt lead.");

  // ── Talking points ──
  const interestLabels = (trip?.interests ?? [])
    .map((value) => INTEREST_OPTIONS.find((option) => option.value === value)?.label ?? value)
    .filter(Boolean);
  const talkingPoints: string[] = [
    `Xác nhận lại số người, ngày đi và ngân sách (${trip ? formatVND(trip.budget) : "—"}).`,
  ];
  if (ratio > 1.1) {
    talkingPoints.push("Giải thích phần vượt ngân sách hoặc đề xuất phương án tiết kiệm hơn.");
  }
  if (hasAvailabilityRisk) {
    talkingPoints.push("Xác nhận tình trạng chỗ các dịch vụ rủi ro trước khi chốt.");
  }
  if (hasKidsOrElderly) {
    talkingPoints.push("Nhấn mạnh lịch trình phù hợp trẻ em / người lớn tuổi.");
  }
  if (trip?.special_requests?.trim()) {
    talkingPoints.push(`Xác nhận yêu cầu đặc biệt: ${trip.special_requests.trim()}.`);
  }
  if (interestLabels.length > 0 && talkingPoints.length < 4) {
    talkingPoints.push(`Khơi gợi theo sở thích: ${interestLabels.slice(0, 3).join(", ")}.`);
  }

  // ── Upsell / cross-sell (chỉ khi còn dư ngân sách) ──
  const upsell: string[] = [];
  if (ratio < 0.9 && pkg?.tier !== "premium") {
    upsell.push(
      `Còn dư ngân sách — có thể gợi ý nâng lên gói ${PACKAGE_TIER_LABELS.premium} hoặc thêm trải nghiệm đặc sắc.`,
    );
  }
  if (ratio <= 1.0 && (trip?.interests ?? []).includes("food")) {
    upsell.push("Gợi ý thêm trải nghiệm ẩm thực địa phương (khách quan tâm ăn uống).");
  }

  return {
    summary,
    budgetFit,
    buyingIntent,
    riskFlags,
    talkingPoints: talkingPoints.slice(0, 5),
    nextBestAction: NEXT_ACTION[booking.status],
    upsell,
  };
}
