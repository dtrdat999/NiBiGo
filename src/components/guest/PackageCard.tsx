import type { TourPackage } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { BookingButton } from "@/components/guest/BookingButton";
import { formatVND, cn } from "@/lib/utils";
import {
  countServiceItinerarySlots,
  isSystemItinerarySlot,
} from "@/lib/itinerary/structure";
import { PACKAGE_TIER_LABELS, ROUTES } from "@/lib/constants";

const tierTone = { budget: "neutral", balanced: "green", premium: "gold" } as const;

const tierMeta = {
  budget: {
    eyebrow: "Tối ưu chi phí",
    icon: "wallet" as IconName,
    iconClass: "bg-brand-cream text-brand-muted",
    accent: "border-black/5",
  },
  balanced: {
    eyebrow: "Phù hợp nhất",
    icon: "compass" as IconName,
    iconClass: "bg-brand-green text-white",
    accent: "border-brand-green/30 ring-1 ring-brand-green/15",
  },
  premium: {
    eyebrow: "Ưu tiên trải nghiệm",
    icon: "sparkles" as IconName,
    iconClass: "bg-brand-gold-soft text-[#9f6818]",
    accent: "border-brand-gold/25",
  },
};

const costLabels = [
  ["hotel", "Lưu trú", "building"],
  ["transport", "Di chuyển", "car"],
  ["activity", "Hoạt động", "ticket"],
  ["restaurant", "Ẩm thực", "utensils"],
  ["other", "Dịch vụ khác", "sparkles"],
] as const;

function includedGroups(pkg: TourPackage) {
  return costLabels.filter(([key]) => pkg.cost_breakdown[key] > 0);
}

function itineraryHighlights(pkg: TourPackage) {
  return pkg.itinerary
    .flatMap((day) =>
      day.slots
        .filter((slot) => !isSystemItinerarySlot(slot))
        .map((slot) => slot.description),
    )
    .filter((description, index, all) => all.indexOf(description) === index)
    .slice(0, 3);
}

function buyerFriendlyCondition(condition: string) {
  return condition
    .replace(/admin\/sales|sales\/admin|sales|admin/gi, "tư vấn viên")
    .replace(/availability/gi, "tình trạng còn chỗ")
    .replace(/booking request/gi, "yêu cầu tư vấn");
}

export function PackageCard({
  pkg,
  tripBudget,
}: {
  pkg: TourPackage;
  tripBudget: number;
}) {
  const highlighted = pkg.tier === "balanced";
  const meta = tierMeta[pkg.tier];
  const groups = includedGroups(pkg);
  const highlights = itineraryHighlights(pkg);
  const serviceCount = countServiceItinerarySlots(pkg.itinerary);
  const budgetDifference = pkg.total_price - tripBudget;

  return (
    <article
      className={cn(
        "relative flex h-full min-h-[760px] flex-col overflow-hidden rounded-[26px] border bg-white shadow-card",
        meta.accent,
      )}
    >
      {highlighted && (
        <div className="bg-brand-green px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-white">
          Phù hợp nhất với nhu cầu
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge tone={tierTone[pkg.tier]}>{PACKAGE_TIER_LABELS[pkg.tier]}</Badge>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-muted">
              {meta.eyebrow}
            </p>
          </div>
          <span className={`grid h-11 w-11 place-items-center rounded-2xl ${meta.iconClass}`}>
            <Icon name={meta.icon} className="h-5 w-5" />
          </span>
        </div>

        <div className="min-h-[84px] pt-4">
          <h3 className="line-clamp-2 text-xl font-bold leading-tight text-brand-ink">{pkg.name}</h3>
          <p className="mt-2 text-xs font-semibold text-brand-muted">
            {pkg.itinerary.length} ngày · {serviceCount} dịch vụ chính
          </p>
        </div>

        <div className="mt-4 rounded-[20px] bg-brand-cream/75 p-4">
          <p className="text-[11px] font-semibold text-brand-muted">Tổng chi phí dự kiến</p>
          <p className="mt-1 text-2xl font-bold text-brand-green">{formatVND(pkg.total_price)}</p>
          <p
            className={cn(
              "mt-1 text-[11px] font-semibold",
              budgetDifference <= 0 ? "text-brand-green" : "text-status-limited",
            )}
          >
            {budgetDifference <= 0
              ? `Thấp hơn ngân sách ${formatVND(Math.abs(budgetDifference))}`
              : `Cao hơn ngân sách ${formatVND(budgetDifference)}`}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-black/5 px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
              Fit score
            </p>
            <p className="mt-0.5 text-lg font-bold text-brand-ink">{pkg.fit_score}/100</p>
          </div>
          <div className="h-2 w-24 overflow-hidden rounded-full bg-black/5">
            <div
              className={cn(
                "h-full rounded-full",
                pkg.fit_score >= 80
                  ? "bg-brand-green"
                  : pkg.fit_score >= 60
                    ? "bg-brand-gold"
                    : "bg-status-limited",
              )}
              style={{ width: `${Math.min(100, Math.max(0, pkg.fit_score))}%` }}
            />
          </div>
        </div>

        <div className="mt-5 min-h-[90px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold">
            Vì sao phù hợp
          </p>
          <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-brand-muted">
            {pkg.recommendation_reason ?? "Phương án được dựng từ nhu cầu và dữ liệu sản phẩm hiện có."}
          </p>
        </div>

        <div className="mt-5 min-h-[108px] border-t border-black/5 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-muted">
            Nhóm dịch vụ đã gồm
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {groups.map(([key, label, icon]) => (
              <div
                key={key}
                className="flex items-center gap-2 rounded-xl bg-brand-cream/[0.65] px-3 py-2"
              >
                <Icon name={icon} className="h-4 w-4 shrink-0 text-brand-green" />
                <span className="text-[11px] font-semibold text-brand-ink">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 min-h-[112px] border-t border-black/5 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-muted">
            Điểm nhấn lịch trình
          </p>
          <ul className="mt-3 space-y-2">
            {highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2 text-xs leading-relaxed text-brand-muted">
                <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-green" />
                <span className="line-clamp-1">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 min-h-[70px] rounded-2xl bg-brand-gold-soft/[0.65] p-3">
          <p className="flex gap-2 text-[11px] leading-relaxed text-brand-muted">
            <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-[#9f6818]" />
            {pkg.conditions[0]
              ? buyerFriendlyCondition(pkg.conditions[0])
              : "Giá và tình trạng còn chỗ sẽ được kiểm tra trước khi bạn quyết định đặt."}
          </p>
        </div>

        <div className="mt-auto space-y-2 pt-5">
          <ButtonLink href={ROUTES.tour(pkg.id)} className="w-full">
            Xem lịch trình
            <Icon name="arrow-right" className="h-4 w-4" />
          </ButtonLink>
          <div className="grid grid-cols-2 gap-2">
            <ButtonLink href={`${ROUTES.tour(pkg.id)}#refine`} variant="outline" className="px-3">
              Tùy chỉnh
            </ButtonLink>
            <BookingButton
              tourPackageId={pkg.id}
              label="Nhận tư vấn"
              size="md"
              variant={highlighted ? "secondary" : "ghost"}
              className="w-full px-3"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
