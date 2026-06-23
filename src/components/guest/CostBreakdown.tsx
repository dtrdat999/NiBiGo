import type { CostBreakdown as CostBreakdownData } from "@/types";
import { formatVND } from "@/lib/utils";

const ROWS: { key: keyof Omit<CostBreakdownData, "total">; label: string }[] = [
  { key: "transport", label: "Di chuyển" },
  { key: "hotel", label: "Khách sạn" },
  { key: "activity", label: "Hoạt động" },
  { key: "restaurant", label: "Ăn uống" },
  { key: "other", label: "Khác" },
];

export function CostBreakdown({ data }: { data: CostBreakdownData }) {
  return (
    <div className="space-y-1.5 text-sm">
      {ROWS.filter((r) => data[r.key] > 0).map((r) => (
        <div key={r.key} className="flex items-center justify-between text-brand-muted">
          <span>{r.label}</span>
          <span className="tabular-nums">{formatVND(data[r.key])}</span>
        </div>
      ))}
      <div className="flex items-center justify-between border-t border-black/10 pt-2 font-bold text-brand-ink">
        <span>Tổng dự kiến</span>
        <span className="tabular-nums">{formatVND(data.total)}</span>
      </div>
    </div>
  );
}
