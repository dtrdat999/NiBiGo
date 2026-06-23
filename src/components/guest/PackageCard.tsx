import type { TourPackage } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { CostBreakdown } from "@/components/guest/CostBreakdown";
import { formatVND, cn } from "@/lib/utils";
import { PACKAGE_TIER_LABELS, ROUTES } from "@/lib/constants";

const tierTone = { budget: "neutral", balanced: "green", premium: "gold" } as const;

export function PackageCard({ pkg }: { pkg: TourPackage }) {
  const highlighted = pkg.tier === "balanced";

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border bg-white p-5 shadow-card",
        highlighted ? "border-brand-green ring-1 ring-brand-green" : "border-black/5",
      )}
    >
      <div className="flex items-center justify-between">
        <Badge tone={tierTone[pkg.tier]}>{PACKAGE_TIER_LABELS[pkg.tier]}</Badge>
        {highlighted && <span className="text-xs font-bold text-brand-green">Đề xuất</span>}
      </div>

      <h3 className="mt-3 text-lg font-bold text-brand-ink">{pkg.name}</h3>

      <p className="mt-2 text-2xl font-extrabold text-brand-green">{formatVND(pkg.total_price)}</p>
      <div className="mt-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-green-soft px-2 py-0.5 text-xs font-semibold text-brand-green">
          ⭐ Phù hợp {pkg.fit_score}%
        </span>
      </div>

      {pkg.recommendation_reason && (
        <p className="mt-3 text-sm leading-relaxed text-brand-muted">{pkg.recommendation_reason}</p>
      )}

      <div className="mt-4 rounded-xl bg-brand-cream/60 p-3">
        <CostBreakdown data={pkg.cost_breakdown} />
      </div>

      {/* Lịch trình tóm tắt (tiêu đề ngày) — chi tiết ở trang tour */}
      <div className="mt-4 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Lịch trình</p>
        <ul className="space-y-1 text-sm">
          {pkg.itinerary.map((day) => (
            <li key={day.day} className="flex gap-2">
              <span className="font-semibold text-brand-green">N{day.day}</span>
              <span className="text-brand-muted">{day.title}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-5">
        <ButtonLink href={ROUTES.tour(pkg.id)} className="w-full">
          Xem chi tiết
        </ButtonLink>
      </div>
    </div>
  );
}
