import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { PackageCard } from "@/components/guest/PackageCard";
import { TourGenerator } from "@/components/guest/TourGenerator";
import { formatVND } from "@/lib/utils";
import {
  PACKAGE_TIER_LABELS,
  ROUTES,
  TRAVEL_STYLE_LABELS,
  INTEREST_OPTIONS,
} from "@/lib/constants";
import type {
  CostBreakdown,
  PackageTier,
  TourPackage,
  TravelStyle,
  TripRequest,
} from "@/types";

export const metadata: Metadata = {
  title: "3 phương án dành cho bạn — NiBiGo AI Travel Platform",
};
export const dynamic = "force-dynamic";

const tierOrder: Record<PackageTier, number> = {
  budget: 0,
  balanced: 1,
  premium: 2,
};

const tierIcons: Record<PackageTier, IconName> = {
  budget: "wallet",
  balanced: "compass",
  premium: "sparkles",
};

const costNames: { key: keyof Omit<CostBreakdown, "total">; label: string }[] = [
  { key: "hotel", label: "Lưu trú" },
  { key: "transport", label: "Di chuyển" },
  { key: "activity", label: "Hoạt động" },
  { key: "restaurant", label: "Ẩm thực" },
  { key: "other", label: "Khác" },
];

function activeCostGroups(pkg: TourPackage) {
  return costNames.filter(({ key }) => pkg.cost_breakdown[key] > 0).map(({ label }) => label);
}

function budgetStatus(pkg: TourPackage, budget: number) {
  const difference = pkg.total_price - budget;
  if (difference <= 0) return `Thấp hơn ${formatVND(Math.abs(difference))}`;
  return `Cao hơn ${formatVND(difference)}`;
}

function fitLabel(score: number) {
  if (score >= 80) return "Rất phù hợp";
  if (score >= 65) return "Phù hợp";
  return "Cần cân nhắc";
}

function planEditHref(trip: TripRequest) {
  const params = new URLSearchParams({
    days: String(trip.num_days),
    people: String(trip.num_people),
    budget: String(trip.budget),
  });
  if (trip.start_date) params.set("start_date", trip.start_date);
  if (trip.interests[0]) params.set("interest", trip.interests[0]);
  if (trip.special_requests) params.set("special", trip.special_requests);
  return `${ROUTES.plan}?${params.toString()}`;
}

function ComparisonCell({
  children,
  highlighted = false,
}: {
  children: React.ReactNode;
  highlighted?: boolean;
}) {
  return (
    <td
      className={`min-w-44 border-l border-black/5 px-4 py-3.5 text-sm ${
        highlighted ? "bg-brand-green-soft/40" : "bg-white"
      }`}
    >
      {children}
    </td>
  );
}

export default async function ProposalsPage({ params }: { params: { requestId: string } }) {
  const supabase = createClient();

  const { data: tripData } = await supabase
    .from("trip_requests")
    .select("*")
    .eq("id", params.requestId)
    .single();
  if (!tripData) notFound();
  const trip = tripData as TripRequest;

  const { data: packageData } = await supabase
    .from("tour_packages")
    .select("*")
    .eq("trip_request_id", trip.id);
  const packages = ((packageData as TourPackage[] | null) ?? []).sort(
    (a, b) => tierOrder[a.tier] - tierOrder[b.tier],
  );

  const interestLabels = trip.interests.map(
    (value) => INTEREST_OPTIONS.find((option) => option.value === value)?.label ?? value,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <section className="overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-card">
        <div className="grid lg:grid-cols-[1.2fr_.8fr]">
          <div className="relative overflow-hidden bg-brand-green px-6 py-9 text-white sm:px-9 sm:py-11">
            <span className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border-[42px] border-white/[0.055]" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                <Icon name="sparkles" className="h-4 w-4 text-brand-gold" />
                Dựa trên nhu cầu của bạn
              </span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                Kết quả cá nhân hóa
              </p>
              <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
                Ba cách để trải nghiệm Ninh Bình theo nhu cầu của bạn.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/[0.72]">
                So sánh nhanh mức giá, độ phù hợp và cấu trúc dịch vụ. Chi phí được cộng từ từng
                dịch vụ để bạn biết tiền của mình dùng vào đâu.
              </p>
            </div>
          </div>

          <div className="bg-[#fffdf9] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
                  Nhu cầu đã lưu
                </p>
                <h2 className="mt-1 text-xl font-bold text-brand-ink">Tóm tắt chuyến đi</h2>
              </div>
              <Badge tone="green">Đã xác thực</Badge>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl bg-white p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
                  Thời gian
                </dt>
                <dd className="mt-1 font-bold text-brand-ink">
                  {trip.num_days}N{trip.num_nights}Đ
                </dd>
              </div>
              <div className="rounded-2xl bg-white p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
                  Số người
                </dt>
                <dd className="mt-1 font-bold text-brand-ink">{trip.num_people} người</dd>
              </div>
              <div className="rounded-2xl bg-white p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
                  Ngân sách
                </dt>
                <dd className="mt-1 font-bold text-brand-ink">{formatVND(trip.budget)}</dd>
              </div>
              <div className="rounded-2xl bg-white p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
                  Phong cách
                </dt>
                <dd className="mt-1 line-clamp-1 font-bold text-brand-ink">
                  {trip.travel_style
                    ? (TRAVEL_STYLE_LABELS[trip.travel_style as TravelStyle] ?? trip.travel_style)
                    : "Chưa chọn"}
                </dd>
              </div>
            </dl>

            {interestLabels.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {interestLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-brand-green-soft px-3 py-1.5 text-[11px] font-bold text-brand-green"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}

            <Link
              href={planEditHref(trip)}
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-green hover:underline"
            >
              Chỉnh lại nhu cầu
              <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {packages.length === 0 ? (
        <TourGenerator tripRequestId={trip.id} auto />
      ) : (
        <>
          <section>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                  So sánh nhanh
                </p>
                <h2 className="mt-1 text-2xl font-bold text-brand-ink">Chọn phương án phù hợp nhất</h2>
                <p className="mt-1 text-sm text-brand-muted">
                  Các card dùng cùng hệ lưới và chiều cao để bạn so sánh từng vùng thông tin.
                </p>
              </div>
              <TourGenerator tripRequestId={trip.id} auto={false} />
            </div>

            <div className="grid items-stretch gap-5 lg:grid-cols-3">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} tripBudget={trip.budget} />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                Bảng đối chiếu
              </p>
              <h2 className="mt-1 text-2xl font-bold text-brand-ink">
                So sánh bằng dữ liệu có thể kiểm chứng
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brand-muted">
                Bảng không suy đoán hạng sao hoặc tiện ích chưa có trong database. Chỉ hiển thị dữ
                liệu đã được lưu hoặc tính từ itinerary và cost breakdown.
              </p>
            </div>

            <div className="overflow-x-auto rounded-[24px] border border-black/5 bg-white shadow-card">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="min-w-40 bg-brand-cream px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.14em] text-brand-muted">
                      Tiêu chí
                    </th>
                    {packages.map((pkg) => (
                      <th
                        key={pkg.id}
                        className={`min-w-44 border-l border-black/5 px-4 py-4 text-left ${
                          pkg.tier === "balanced" ? "bg-brand-green-soft/70" : "bg-[#fffdf9]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`grid h-8 w-8 place-items-center rounded-xl ${
                              pkg.tier === "balanced"
                                ? "bg-brand-green text-white"
                                : pkg.tier === "premium"
                                  ? "bg-brand-gold-soft text-[#9f6818]"
                                  : "bg-brand-cream text-brand-muted"
                            }`}
                          >
                            <Icon name={tierIcons[pkg.tier]} className="h-4 w-4" />
                          </span>
                          <span className="text-sm font-bold text-brand-ink">
                            {PACKAGE_TIER_LABELS[pkg.tier]}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  <tr>
                    <th className="bg-brand-cream/60 px-4 py-3.5 text-left text-sm font-semibold text-brand-muted">
                      Tổng dự kiến
                    </th>
                    {packages.map((pkg) => (
                      <ComparisonCell key={pkg.id} highlighted={pkg.tier === "balanced"}>
                        <span className="font-bold text-brand-green">{formatVND(pkg.total_price)}</span>
                      </ComparisonCell>
                    ))}
                  </tr>
                  <tr>
                    <th className="bg-brand-cream/60 px-4 py-3.5 text-left text-sm font-semibold text-brand-muted">
                      So với ngân sách
                    </th>
                    {packages.map((pkg) => (
                      <ComparisonCell key={pkg.id} highlighted={pkg.tier === "balanced"}>
                        <span
                          className={
                            pkg.total_price <= trip.budget
                              ? "font-semibold text-brand-green"
                              : "font-semibold text-status-limited"
                          }
                        >
                          {budgetStatus(pkg, trip.budget)}
                        </span>
                      </ComparisonCell>
                    ))}
                  </tr>
                  <tr>
                    <th className="bg-brand-cream/60 px-4 py-3.5 text-left text-sm font-semibold text-brand-muted">
                      Độ phù hợp
                    </th>
                    {packages.map((pkg) => (
                      <ComparisonCell key={pkg.id} highlighted={pkg.tier === "balanced"}>
                        <span className="font-bold text-brand-ink">{pkg.fit_score}/100</span>
                        <span className="ml-2 text-xs text-brand-muted">{fitLabel(pkg.fit_score)}</span>
                      </ComparisonCell>
                    ))}
                  </tr>
                  <tr>
                    <th className="bg-brand-cream/60 px-4 py-3.5 text-left text-sm font-semibold text-brand-muted">
                      Lịch trình
                    </th>
                    {packages.map((pkg) => (
                      <ComparisonCell key={pkg.id} highlighted={pkg.tier === "balanced"}>
                        <span className="font-semibold text-brand-ink">
                          {pkg.itinerary.length} ngày ·{" "}
                          {pkg.itinerary.reduce((sum, day) => sum + day.slots.length, 0)} mục
                        </span>
                      </ComparisonCell>
                    ))}
                  </tr>
                  <tr>
                    <th className="bg-brand-cream/60 px-4 py-3.5 text-left text-sm font-semibold text-brand-muted">
                      Nhóm chi phí
                    </th>
                    {packages.map((pkg) => (
                      <ComparisonCell key={pkg.id} highlighted={pkg.tier === "balanced"}>
                        <span className="text-xs leading-relaxed text-brand-muted">
                          {activeCostGroups(pkg).join(" · ")}
                        </span>
                      </ComparisonCell>
                    ))}
                  </tr>
                  <tr>
                    <th className="bg-brand-cream/60 px-4 py-3.5 text-left text-sm font-semibold text-brand-muted">
                      Cần xác nhận
                    </th>
                    {packages.map((pkg) => (
                      <ComparisonCell key={pkg.id} highlighted={pkg.tier === "balanced"}>
                        <span className="text-xs font-semibold text-brand-muted">
                          {pkg.conditions.length} điều kiện
                        </span>
                      </ComparisonCell>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                Vì sao được đề xuất?
              </p>
              <h2 className="mt-1 text-2xl font-bold text-brand-ink">
                Mỗi phương án phục vụ một ưu tiên khác nhau
              </h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="flex h-full flex-col p-5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-2xl ${
                        pkg.tier === "balanced"
                          ? "bg-brand-green text-white"
                          : pkg.tier === "premium"
                            ? "bg-brand-gold-soft text-[#9f6818]"
                            : "bg-brand-cream text-brand-muted"
                      }`}
                    >
                      <Icon name={tierIcons[pkg.tier]} className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">
                        {PACKAGE_TIER_LABELS[pkg.tier]}
                      </p>
                      <p className="font-bold text-brand-ink">{pkg.name}</p>
                    </div>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-7 text-brand-muted">
                    {pkg.recommendation_reason ??
                      "Phương án được tạo từ dữ liệu chuyến đi và các sản phẩm hiện có."}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-5 rounded-[28px] border border-brand-gold/20 bg-brand-gold-soft/[0.55] p-6 sm:flex-row sm:items-start sm:p-8">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-[#9f6818] shadow-sm">
              <Icon name="shield" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-brand-ink">Lưu ý trước khi chọn phương án</h2>
              <p className="mt-2 max-w-4xl text-sm leading-7 text-brand-muted">
                Giá và trạng thái còn chỗ đang là dự kiến. Khi bạn gửi yêu cầu tư vấn, một tư vấn
                viên sẽ kiểm tra lại từng dịch vụ và chi phí trước khi bạn quyết định đặt.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
