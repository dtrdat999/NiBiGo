import type { ItineraryDay, ItinerarySlot, SlotTime } from "@/types";

export const SYSTEM_ITINERARY_SLOT_PRODUCT_ID =
  "00000000-0000-0000-0000-000000000000";

export const ITINERARY_SLOT_ORDER = [
  "morning",
  "noon",
  "afternoon",
  "evening",
] as const satisfies readonly SlotTime[];

export const ITINERARY_SLOT_LABELS: Record<SlotTime, string> = {
  morning: "Buổi sáng",
  noon: "Buổi trưa",
  afternoon: "Buổi chiều",
  evening: "Buổi tối",
};

export const ITINERARY_SLOT_TIMES: Record<SlotTime, string> = {
  morning: "08:00",
  noon: "12:00",
  afternoon: "14:30",
  evening: "18:30",
};

const SLOT_INDEX = new Map<SlotTime, number>(
  ITINERARY_SLOT_ORDER.map((slot, index) => [slot, index]),
);

const FALLBACK_SLOT_DESCRIPTION: Record<SlotTime, string> = {
  morning:
    "Bắt đầu ngày mới nhẹ nhàng, kiểm tra thời gian di chuyển trước khi tham quan.",
  noon:
    "Nghỉ trưa và ăn uống linh hoạt theo sức khỏe của đoàn. Nếu cần, tư vấn viên có thể gợi ý quán phù hợp hơn.",
  afternoon:
    "Giữ nhịp tham quan vừa phải. Bạn có thể đổi sang hoạt động nhẹ hơn nếu đoàn cần nghỉ thêm.",
  evening:
    "Nghỉ ngơi, dùng bữa tối hoặc tự do dạo quanh khu lưu trú theo sức của đoàn.",
};

function isKnownSlot(value: string): value is SlotTime {
  return SLOT_INDEX.has(value as SlotTime);
}

export function isSystemItinerarySlot(slot: Pick<ItinerarySlot, "product_id">) {
  return slot.product_id === SYSTEM_ITINERARY_SLOT_PRODUCT_ID;
}

export function compareItinerarySlots(a: ItinerarySlot, b: ItinerarySlot) {
  return (SLOT_INDEX.get(a.time) ?? 99) - (SLOT_INDEX.get(b.time) ?? 99);
}

export function normalizeItineraryDays(
  itinerary: ItineraryDay[],
  expectedDays?: number,
): ItineraryDay[] {
  const sourceDays = itinerary.filter((day) => Number.isFinite(day.day));
  const maxDay = Math.max(
    1,
    expectedDays ?? 0,
    ...sourceDays.map((day) => Math.max(1, Math.trunc(day.day))),
  );

  const byDay = new Map<number, ItineraryDay>();
  for (const rawDay of sourceDays) {
    const dayNumber = Math.max(1, Math.trunc(rawDay.day));
    const existing = byDay.get(dayNumber);
    if (!existing) {
      byDay.set(dayNumber, {
        day: dayNumber,
        title: rawDay.title?.trim() || `Ngày ${dayNumber}`,
        slots: [...rawDay.slots],
      });
      continue;
    }

    existing.slots.push(...rawDay.slots);
    if (!existing.title && rawDay.title) existing.title = rawDay.title;
  }

  return Array.from({ length: maxDay }, (_, index) => {
    const dayNumber = index + 1;
    const day = byDay.get(dayNumber);
    const slots = (day?.slots ?? [])
      .filter((slot): slot is ItinerarySlot => isKnownSlot(slot.time))
      .map((slot) => ({
        ...slot,
        product_id: slot.product_id || SYSTEM_ITINERARY_SLOT_PRODUCT_ID,
        description: slot.description?.trim() || FALLBACK_SLOT_DESCRIPTION[slot.time],
      }));

    const existingSlots = new Set(slots.map((slot) => slot.time));
    const missingSlots = ITINERARY_SLOT_ORDER.filter((slot) => !existingSlots.has(slot)).map(
      (time) => ({
        time,
        product_id: SYSTEM_ITINERARY_SLOT_PRODUCT_ID,
        description: FALLBACK_SLOT_DESCRIPTION[time],
      }),
    );

    return {
      day: dayNumber,
      title: day?.title?.trim() || `Ngày ${dayNumber}`,
      slots: [...slots, ...missingSlots].sort(compareItinerarySlots),
    };
  });
}

export function countServiceItinerarySlots(itinerary: ItineraryDay[]) {
  return itinerary.reduce(
    (total, day) =>
      total + day.slots.filter((slot) => !isSystemItinerarySlot(slot)).length,
    0,
  );
}
