import type { ItineraryDay, SlotTime } from "@/types";

const SLOT_LABEL: Record<SlotTime, string> = {
  morning: "Sáng",
  afternoon: "Chiều",
  evening: "Tối",
};
const SLOT_ICON: Record<SlotTime, string> = {
  morning: "🌅",
  afternoon: "☀️",
  evening: "🌙",
};

export function ItineraryTimeline({ itinerary }: { itinerary: ItineraryDay[] }) {
  return (
    <div className="space-y-7">
      {itinerary.map((day) => (
        <div key={day.day}>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-green text-sm font-bold text-white">
              {day.day}
            </span>
            <h3 className="font-bold text-brand-ink">{day.title}</h3>
          </div>

          <ol className="ml-4 mt-3 space-y-3 border-l-2 border-brand-green-soft pl-6">
            {day.slots.map((slot, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[31px] top-1 grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] ring-2 ring-brand-green-soft">
                  {SLOT_ICON[slot.time]}
                </span>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
                  {SLOT_LABEL[slot.time]}
                </p>
                <p className="mt-0.5 text-sm text-brand-ink">{slot.description}</p>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
