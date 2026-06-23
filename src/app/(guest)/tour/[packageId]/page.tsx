import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CostBreakdown } from "@/components/guest/CostBreakdown";
import { ItineraryTimeline } from "@/components/guest/ItineraryTimeline";
import { ReviseBox } from "@/components/guest/ReviseBox";
import { BookingButton } from "@/components/guest/BookingButton";
import { formatVND } from "@/lib/utils";
import { PACKAGE_TIER_LABELS, ROUTES } from "@/lib/constants";
import type { TourPackage } from "@/types";

export const metadata: Metadata = { title: "Chi tiết tour — NiBiGo AI Travel Platform" };
export const dynamic = "force-dynamic";

const tierTone = { budget: "neutral", balanced: "green", premium: "gold" } as const;

export default async function TourDetailPage({ params }: { params: { packageId: string } }) {
  const supabase = createClient();
  const { data } = await supabase
    .from("tour_packages")
    .select("*")
    .eq("id", params.packageId)
    .single();
  if (!data) notFound();
  const pkg = data as TourPackage;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={ROUTES.proposals(pkg.trip_request_id)}
        className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-ink"
      >
        ← Về 3 gói gợi ý
      </Link>

      {/* Header */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge tone={tierTone[pkg.tier]}>{PACKAGE_TIER_LABELS[pkg.tier]}</Badge>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-green-soft px-2 py-0.5 text-xs font-semibold text-brand-green">
            ⭐ Phù hợp {pkg.fit_score}%
          </span>
        </div>
        <h1 className="text-2xl font-bold text-brand-ink">{pkg.name}</h1>
        {pkg.recommendation_reason && (
          <p className="text-brand-muted">{pkg.recommendation_reason}</p>
        )}
        <p className="text-3xl font-extrabold text-brand-green">{formatVND(pkg.total_price)}</p>
      </Card>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Itinerary */}
        <Card className="md:col-span-3">
          <h2 className="mb-4 font-bold text-brand-ink">Lịch trình chi tiết</h2>
          <ItineraryTimeline itinerary={pkg.itinerary} />
        </Card>

        {/* Sidebar: chi phí + điều kiện */}
        <div className="space-y-4 md:col-span-2">
          <Card>
            <h2 className="mb-3 font-bold text-brand-ink">Chi phí dự kiến</h2>
            <CostBreakdown data={pkg.cost_breakdown} />
          </Card>

          {pkg.conditions.length > 0 && (
            <Card>
              <h2 className="mb-2 font-bold text-brand-ink">Điều kiện</h2>
              <ul className="list-disc space-y-1 pl-4 text-sm text-brand-muted">
                {pkg.conditions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <h2 className="font-bold text-brand-ink">Chỉnh tour bằng AI</h2>
            <p className="mb-3 mt-1 text-sm text-brand-muted">
              Gõ điều bạn muốn đổi — AI cập nhật lịch trình và tính lại giá.
            </p>
            <ReviseBox packageId={pkg.id} />
          </Card>

          <BookingButton tourPackageId={pkg.id} />
        </div>
      </div>
    </div>
  );
}
