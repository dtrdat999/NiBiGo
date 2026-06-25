import type { BookingRequest, TourPackage, TripRequest } from "@/types";

export type SalesPriority = {
  score: number;
  level: "urgent" | "high" | "normal";
  label: string;
  reasons: string[];
};

function daysUntil(date: string | null, now: Date) {
  if (!date) return null;
  const target = new Date(`${date}T00:00:00+07:00`);
  const today = new Date(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(now) + "T00:00:00+07:00",
  );
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

export function calculateSalesPriority({
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
}): SalesPriority {
  let score = 0;
  const reasons: string[] = [];
  const days = daysUntil(trip?.start_date ?? null, now);

  if (days !== null && days <= 3) {
    score += 35;
    reasons.push(days < 0 ? "Ngày khởi hành đã qua" : `Ngày đi còn ${days} ngày`);
  } else if (days !== null && days <= 7) {
    score += 22;
    reasons.push(`Ngày đi còn ${days} ngày`);
  }

  if (booking.status === "new") {
    score += 25;
    reasons.push("Chưa liên hệ khách");
  }

  if (!booking.assigned_sales_id) {
    score += 15;
    reasons.push("Chưa có người phụ trách");
  }

  if (hasAvailabilityRisk) {
    score += 20;
    reasons.push("Có dịch vụ cần kiểm tra");
  }

  if (trip?.special_requests?.trim()) {
    score += 10;
    reasons.push("Có yêu cầu đặc biệt");
  }

  if (booking.total_price >= 10_000_000) {
    score += 10;
    reasons.push("Giá trị yêu cầu cao");
  }

  if (pkg?.tier === "premium") {
    score += 8;
    reasons.push("Gói ưu tiên trải nghiệm");
  }

  if (score >= 60) return { score, level: "urgent", label: "Cần xử lý ngay", reasons };
  if (score >= 40) return { score, level: "high", label: "Ưu tiên cao", reasons };
  return {
    score,
    level: "normal",
    label: "Theo thứ tự",
    reasons: reasons.length > 0 ? reasons : ["Chưa có cảnh báo đặc biệt"],
  };
}
