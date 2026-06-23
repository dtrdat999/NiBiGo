import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PackageCard } from "@/components/guest/PackageCard";
import { TourGenerator } from "@/components/guest/TourGenerator";
import { formatVND } from "@/lib/utils";
import { TRAVEL_STYLE_LABELS, INTEREST_OPTIONS } from "@/lib/constants";
import type { TripRequest, TourPackage, TravelStyle } from "@/types";

export const metadata: Metadata = { title: "Gợi ý tour — NiBiGo AI Travel Platform" };
export const dynamic = "force-dynamic";

export default async function ProposalsPage({ params }: { params: { requestId: string } }) {
  const supabase = createClient();

  const { data: tripData } = await supabase
    .from("trip_requests")
    .select("*")
    .eq("id", params.requestId)
    .single();
  if (!tripData) notFound();
  const trip = tripData as TripRequest;

  const { data: pkgData } = await supabase
    .from("tour_packages")
    .select("*")
    .eq("trip_request_id", trip.id)
    .order("total_price", { ascending: true });
  const packages = (pkgData as TourPackage[] | null) ?? [];

  const interestLabels = trip.interests
    .map((v) => INTEREST_OPTIONS.find((o) => o.value === v)?.label ?? v)
    .join(", ");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Gợi ý tour cho bạn</h1>
        <p className="mt-1 text-brand-muted">3 gói được dựng từ kho dịch vụ, chi phí tính minh bạch.</p>
      </div>

      {/* Tóm tắt nhu cầu */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-brand-ink">Nhu cầu của bạn</h2>
          <Badge tone="neutral">Đã lưu</Badge>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-brand-muted">Thời gian</dt>
            <dd className="font-medium text-brand-ink">
              {trip.num_days} ngày {trip.num_nights} đêm
            </dd>
          </div>
          <div>
            <dt className="text-brand-muted">Số người</dt>
            <dd className="font-medium text-brand-ink">{trip.num_people} người</dd>
          </div>
          <div>
            <dt className="text-brand-muted">Ngân sách</dt>
            <dd className="font-medium text-brand-ink">{formatVND(trip.budget)}</dd>
          </div>
          <div>
            <dt className="text-brand-muted">Phong cách</dt>
            <dd className="font-medium text-brand-ink">
              {trip.travel_style
                ? (TRAVEL_STYLE_LABELS[trip.travel_style as TravelStyle] ?? trip.travel_style)
                : "—"}
            </dd>
          </div>
          {interestLabels && (
            <div className="col-span-2 sm:col-span-4">
              <dt className="text-brand-muted">Sở thích</dt>
              <dd className="font-medium text-brand-ink">{interestLabels}</dd>
            </div>
          )}
          {trip.special_requests && (
            <div className="col-span-2 sm:col-span-4">
              <dt className="text-brand-muted">Yêu cầu đặc biệt</dt>
              <dd className="font-medium text-brand-ink">{trip.special_requests}</dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Gói tour */}
      {packages.length === 0 ? (
        <TourGenerator tripRequestId={trip.id} auto />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-brand-ink">3 gói gợi ý</h2>
            <TourGenerator tripRequestId={trip.id} auto={false} />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
          <p className="text-center text-xs text-brand-muted">
            Bấm “Xem chi tiết” để xem lịch trình AI viết đầy đủ. Chọn gói &amp; chỉnh tour bằng AI
            sẽ có ở Phase 7.
          </p>
        </>
      )}
    </div>
  );
}
