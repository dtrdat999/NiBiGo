import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { BookingForm } from "@/components/guest/BookingForm";
import { CostBreakdown } from "@/components/guest/CostBreakdown";
import { formatVND } from "@/lib/utils";
import { countServiceItinerarySlots } from "@/lib/itinerary/structure";
import { PACKAGE_TIER_LABELS, ROUTES } from "@/lib/constants";
import type { Profile, TourPackage, TripRequest } from "@/types";

export const metadata: Metadata = {
  title: "Gửi yêu cầu đặt dịch vụ — NiBiGo AI Travel Platform",
};
export const dynamic = "force-dynamic";

const tierTone = { budget: "neutral", balanced: "green", premium: "gold" } as const;

function formatDate(startDate: string | null) {
  if (!startDate) return "Chưa chọn ngày";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(`${startDate}T00:00:00+07:00`));
}

export default async function BookingRequestPage({
  params,
}: {
  params: { packageId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: packageData } = await supabase
    .from("tour_packages")
    .select("*")
    .eq("id", params.packageId)
    .single();
  if (!packageData) notFound();
  const pkg = packageData as TourPackage;

  const [{ data: tripData }, { data: profileData }] = await Promise.all([
    supabase.from("trip_requests").select("*").eq("id", pkg.trip_request_id).single(),
    user
      ? supabase.from("profiles").select("*").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
  ]);
  if (!tripData) notFound();
  const trip = tripData as TripRequest;
  const profile = profileData as Profile | null;
  const totalActivities = countServiceItinerarySlots(pkg.itinerary);

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <Link
        href={ROUTES.tour(pkg.id)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted transition-colors hover:text-brand-green"
      >
        <span aria-hidden="true">←</span>
        Quay lại lịch trình
      </Link>

      <section className="rounded-[28px] border border-black/5 bg-white px-6 py-7 shadow-card sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
              Bước xác nhận cuối
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-brand-ink sm:text-4xl">
              Gửi yêu cầu đặt dịch vụ
            </h1>
            <p className="mt-3 text-sm leading-7 text-brand-muted sm:text-base">
              Kiểm tra lại hành trình, điền thông tin liên hệ và gửi yêu cầu. Bạn chưa cần thanh
              toán ở bước này.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-brand-muted">
            {[
              ["check", "Chọn phương án", true],
              ["user", "Xác nhận", true],
              ["headset", "Sales liên hệ", false],
            ].map(([icon, label, active], index) => (
              <div key={String(label)} className="flex items-center gap-2">
                {index > 0 && <span className="h-px w-4 bg-black/10" />}
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full ${
                    active ? "bg-brand-green text-white" : "bg-black/5 text-brand-muted"
                  }`}
                >
                  <Icon name={icon as IconName} className="h-3.5 w-3.5" />
                </span>
                <span className="hidden sm:inline">{String(label)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <main className="rounded-[28px] border border-black/5 bg-white p-6 shadow-card sm:p-8">
          <BookingForm
            tourPackageId={pkg.id}
            initialName={profile?.full_name ?? ""}
            initialEmail={profile?.email ?? user?.email ?? ""}
            cancelHref={ROUTES.tour(pkg.id)}
          />
        </main>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-card">
            <div className="bg-gradient-to-br from-[#2f7d5c] via-brand-green to-brand-green-dark p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <Badge
                  tone={tierTone[pkg.tier]}
                  className="bg-white/95 px-3 py-1 text-brand-green"
                >
                  {PACKAGE_TIER_LABELS[pkg.tier]}
                </Badge>
                <Icon name="route" className="h-5 w-5 text-brand-gold" />
              </div>
              <h2 className="mt-4 text-xl font-bold leading-snug">{pkg.name}</h2>
              <p className="mt-2 text-xs leading-5 text-white/[0.7]">
                {pkg.itinerary.length} ngày · {totalActivities} dịch vụ chính
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-3 p-5 text-sm">
              <div className="rounded-2xl bg-brand-cream/[0.65] p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Khởi hành
                </dt>
                <dd className="mt-1 font-bold text-brand-ink">{formatDate(trip.start_date)}</dd>
              </div>
              <div className="rounded-2xl bg-brand-cream/[0.65] p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Số khách
                </dt>
                <dd className="mt-1 font-bold text-brand-ink">{trip.num_people} người</dd>
              </div>
              <div className="rounded-2xl bg-brand-cream/[0.65] p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Thời lượng
                </dt>
                <dd className="mt-1 font-bold text-brand-ink">
                  {trip.num_days}N{trip.num_nights}Đ
                </dd>
              </div>
              <div className="rounded-2xl bg-brand-cream/[0.65] p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Độ phù hợp
                </dt>
                <dd className="mt-1 font-bold text-brand-ink">{pkg.fit_score}%</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[24px] border border-black/5 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold">
                  Xem lại chi phí
                </p>
                <h2 className="mt-1 text-lg font-bold text-brand-ink">Tổng dự kiến</h2>
              </div>
              <strong className="text-lg text-brand-green">{formatVND(pkg.total_price)}</strong>
            </div>
            <div className="mt-5 border-t border-black/5 pt-5">
              <CostBreakdown data={pkg.cost_breakdown} people={trip.num_people} />
            </div>
          </section>

          <section className="rounded-[24px] border border-brand-gold/20 bg-brand-gold-soft/[0.45] p-5">
            <div className="flex items-start gap-3">
              <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold" />
              <div>
                <h2 className="font-bold text-brand-ink">Bạn chưa thanh toán</h2>
                <p className="mt-1 text-xs leading-5 text-brand-muted">
                  Sau khi gửi, hệ thống tạo mã booking. Sales sẽ kiểm tra chỗ, xác nhận giá cuối
                  cùng và liên hệ theo kênh bạn chọn.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
