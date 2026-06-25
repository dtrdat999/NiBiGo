import type { CostBreakdown as CostBreakdownData } from "@/types";
import { Icon, type IconName } from "@/components/ui/Icon";
import { formatVND } from "@/lib/utils";

const ROWS: {
  key: keyof Omit<CostBreakdownData, "total">;
  label: string;
  icon: IconName;
}[] = [
  { key: "transport", label: "Di chuyển", icon: "car" },
  { key: "hotel", label: "Lưu trú", icon: "building" },
  { key: "activity", label: "Hoạt động", icon: "ticket" },
  { key: "restaurant", label: "Ẩm thực", icon: "utensils" },
  { key: "other", label: "Dịch vụ khác", icon: "sparkles" },
];

export function CostBreakdown({
  data,
  people = 1,
}: {
  data: CostBreakdownData;
  people?: number;
}) {
  const visibleRows = ROWS.filter((row) => data[row.key] > 0);
  const safeTotal = Math.max(1, data.total);

  return (
    <div>
      <div className="space-y-4">
        {visibleRows.map((row) => {
          const percent = Math.round((data[row.key] / safeTotal) * 100);
          return (
            <div key={row.key}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="inline-flex items-center gap-2 font-semibold text-brand-muted">
                  <Icon name={row.icon} className="h-4 w-4 text-brand-green" />
                  {row.label}
                </span>
                <span className="font-bold tabular-nums text-brand-ink">
                  {formatVND(data[row.key])}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/5">
                <div
                  className="h-full rounded-full bg-brand-green"
                  style={{ width: `${Math.max(4, percent)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-[18px] bg-brand-green-soft/[0.65] p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">
              Tổng dự kiến
            </p>
            <p className="mt-1 text-2xl font-bold text-brand-green">
              {formatVND(data.total)}
            </p>
          </div>
          <p className="text-right text-[11px] leading-5 text-brand-muted">
            Khoảng
            <br />
            <strong className="text-brand-ink">
              {formatVND(Math.round(data.total / Math.max(1, people)))}
            </strong>{" "}
            / người
          </p>
        </div>
      </div>
    </div>
  );
}
