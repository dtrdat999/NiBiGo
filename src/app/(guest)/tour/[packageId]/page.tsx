import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { CostBreakdown } from "@/components/guest/CostBreakdown";
import { ItineraryMap } from "@/components/guest/ItineraryMap";
import { ItineraryTimeline } from "@/components/guest/ItineraryTimeline";
import { ReviseBox } from "@/components/guest/ReviseBox";
import { BookingButton } from "@/components/guest/BookingButton";
import { formatVND } from "@/lib/utils";
import {
  countServiceItinerarySlots,
  isSystemItinerarySlot,
  normalizeItineraryDays,
} from "@/lib/itinerary/structure";
import { PACKAGE_TIER_LABELS, ROUTES } from "@/lib/constants";
import type {
  ProductLocation,
  TourPackage,
  TravelProduct,
  TripRequest,
} from "@/types";

export const metadata: Metadata = {
  title: "Chi tiết hành trình — NiBiGo AI Travel Platform",
};
export const dynamic = "force-dynamic";

const tierTone = { budget: "neutral", balanced: "green", premium: "gold" } as const;

function fitLabel(score: number) {
  if (score >= 80) return "Rất phù hợp";
  if (score >= 65) return "Phù hợp";
  return "Nên xem kỹ";
}

function buyerFriendlyCondition(condition: string) {
  return condition
    .replace(/admin\/sales|sales\/admin|sales|admin/gi, "tư vấn viên")
    .replace(/availability/gi, "tình trạng còn chỗ")
    .replace(/booking request/gi, "yêu cầu tư vấn");
}

function formatDateRange(startDate: string | null, numDays: number) {
  if (!startDate) return `${numDays} ngày linh hoạt`;

  const start = new Date(`${startDate}T00:00:00+07:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + Math.max(0, numDays - 1));
  const formatter = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export default async function TourDetailPage({
  params,
}: {
  params: { packageId: string };
}) {
  const supabase = createClient();
  const { data: packageData } = await supabase
    .from("tour_packages")
    .select("*")
    .eq("id", params.packageId)
    .single();
  if (!packageData) notFound();
  const pkg = packageData as TourPackage;

  const { data: tripData } = await supabase
    .from("trip_requests")
    .select("*")
    .eq("id", pkg.trip_request_id)
    .single();
  if (!tripData) notFound();
  const trip = tripData as TripRequest;
  const itinerary = normalizeItineraryDays(pkg.itinerary, trip.num_days);

  const productIds = Array.from(
    new Set(
      itinerary.flatMap((day) =>
        day.slots
          .filter((slot) => !isSystemItinerarySlot(slot))
          .map((slot) => slot.product_id),
      ),
    ),
  ).filter(Boolean);

  let products: TravelProduct[] = [];
  let locations: ProductLocation[] = [];

  if (productIds.length > 0) {
    const [{ data: productData }, { data: locationData }] = await Promise.all([
      supabase.from("products").select("*").in("id", productIds),
      supabase.from("product_locations").select("*").in("product_id", productIds),
    ]);
    products = (productData as TravelProduct[] | null) ?? [];
    locations = (locationData as ProductLocation[] | null) ?? [];
  }

  const dateRange = formatDateRange(trip.start_date, trip.num_days);
  const itineraryItems = countServiceItinerarySlots(itinerary);

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <Link
        href={ROUTES.proposals(pkg.trip_request_id)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted transition-colors hover:text-brand-green"
      >
        <span aria-hidden="true">←</span>
        Quay lại 3 phương án
      </Link>

      <section className="overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-card">
        <div className="grid lg:grid-cols-[1.25fr_.75fr]">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#2f7d5c] via-brand-green to-brand-green-dark px-6 py-9 text-white sm:px-9 sm:py-11">
            <span className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border-[46px] border-white/[0.055]" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  tone={tierTone[pkg.tier]}
                  className="bg-white/95 px-3 py-1 text-brand-green"
                >
                  {PACKAGE_TIER_LABELS[pkg.tier]}
                </Badge>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">
                  <Icon name="check" className="h-3.5 w-3.5 text-brand-gold" />
                  Đã lưu tự động
                </span>
                {pkg.revision_count > 0 && (
                  <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/[0.75]">
                    Đã chỉnh {pkg.revision_count} lần
                  </span>
                )}
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                Hành trình của bạn
              </p>
              <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
                {pkg.name}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/[0.75] sm:text-base">
                {pkg.recommendation_reason ??
                  "Lịch trình được xây dựng từ nhu cầu của bạn và dữ liệu dịch vụ hiện có."}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#itinerary"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 text-sm font-bold text-brand-ink transition hover:brightness-95"
                >
                  <Icon name="route" className="h-4 w-4" />
                  Xem lịch trình
                </a>
                <a
                  href="#refine"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  <Icon name="sparkles" className="h-4 w-4" />
                  Tinh chỉnh bằng AI
                </a>
              </div>
            </div>
          </div>

          <div className="bg-[#fffdf9] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
              Tổng quan
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["calendar", "Thời gian", dateRange],
                ["users", "Số người", `${trip.num_people} người`],
                ["route", "Lịch trình", `${itineraryItems} hoạt động`],
                ["sparkles", "Độ phù hợp", `${fitLabel(pkg.fit_score)} · ${pkg.fit_score}%`],
              ].map(([icon, label, value]) => (
                <div key={label} className="min-h-[94px] rounded-2xl bg-white p-3.5">
                  <Icon
                    name={icon as "calendar" | "users" | "route" | "sparkles"}
                    className="h-4 w-4 text-brand-green"
                  />
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-bold leading-5 text-brand-ink">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-[20px] bg-brand-green-soft/[0.65] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                Tổng chi phí dự kiến
              </p>
              <p className="mt-1 text-2xl font-bold text-brand-green">
                {formatVND(pkg.total_price)}
              </p>
              <p className="mt-1 text-xs text-brand-muted">
                Giá và chỗ trống sẽ được Sales xác nhận trước khi đặt.
              </p>
            </div>
          </div>
        </div>
      </section>

      <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-black/5 bg-white p-2 shadow-card">
        {[
          ["#itinerary", "Lịch trình", "route"],
          ["#map", "Vị trí", "map"],
          ["#explanation", "Lý do đề xuất", "sparkles"],
          ["#refine", "Tinh chỉnh", "sliders"],
        ].map(([href, label, icon]) => (
          <a
            key={href}
            href={href}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-brand-muted transition-colors hover:bg-brand-green-soft hover:text-brand-green"
          >
            <Icon
              name={icon as "route" | "map" | "sparkles" | "sliders"}
              className="h-4 w-4"
            />
            {label}
          </a>
        ))}
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <main className="min-w-0 space-y-8">
          <section id="itinerary" className="scroll-mt-24">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                Theo từng ngày
              </p>
              <h2 className="mt-1 text-2xl font-bold text-brand-ink">
                Lịch trình chi tiết
              </h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                Mỗi khung giờ hiển thị dịch vụ, thời lượng và trạng thái hiện tại.
              </p>
            </div>
            <ItineraryTimeline
              itinerary={itinerary}
              products={products}
              locations={locations}
            />
          </section>

          <section id="map" className="scroll-mt-24">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                Không gian hành trình
              </p>
              <h2 className="mt-1 text-2xl font-bold text-brand-ink">
                Vị trí các dịch vụ
              </h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                Tọa độ và địa chỉ được lấy trực tiếp từ dữ liệu do Editor quản lý.
              </p>
            </div>
            <ItineraryMap locations={locations} products={products} />
          </section>

          <section
            id="explanation"
            className="scroll-mt-24 overflow-hidden rounded-[26px] border border-brand-gold/20 bg-brand-gold-soft/[0.55] p-6 sm:p-7"
          >
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-brand-gold shadow-card">
                <Icon name="sparkles" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
                  Lý do đề xuất
                </p>
                <h2 className="mt-1 text-xl font-bold text-brand-ink">
                  Vì sao hành trình này được đề xuất?
                </h2>
                <p className="mt-3 text-sm leading-7 text-brand-muted">
                  {pkg.recommendation_reason ??
                    "Hành trình cân đối giữa nhu cầu, ngân sách và các dịch vụ đang có trong hệ thống."}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ["wallet", "Chi phí rõ từng mục", "Bạn có thể xem tiền được phân bổ vào đâu."],
                    ["shield", "Dịch vụ cụ thể", "Mỗi hoạt động đều có thông tin để bạn kiểm tra."],
                    ["headset", "Kiểm tra trước khi đặt", "Chỗ trống và giá cuối cùng sẽ được xác nhận."],
                  ].map(([icon, title, body]) => (
                    <div key={title} className="min-h-[112px] rounded-2xl bg-white/80 p-4">
                      <Icon
                        name={icon as "wallet" | "shield" | "headset"}
                        className="h-4 w-4 text-brand-green"
                      />
                      <p className="mt-2 text-xs font-bold text-brand-ink">{title}</p>
                      <p className="mt-1 text-[11px] leading-5 text-brand-muted">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="rounded-[24px] border border-black/5 bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold">
                  Chi phí minh bạch
                </p>
                <h2 className="mt-1 text-lg font-bold text-brand-ink">Chi phí dự kiến</h2>
              </div>
              <Icon name="wallet" className="h-5 w-5 text-brand-green" />
            </div>
            <div className="mt-5">
              <CostBreakdown data={pkg.cost_breakdown} people={trip.num_people} />
            </div>
          </section>

          {pkg.conditions.length > 0 && (
            <section className="rounded-[24px] border border-brand-gold/20 bg-brand-gold-soft/[0.45] p-5">
              <div className="flex items-center gap-2">
                <Icon name="shield" className="h-5 w-5 text-brand-gold" />
                <h2 className="font-bold text-brand-ink">Điều kiện cần xác nhận</h2>
              </div>
              <ul className="mt-4 space-y-3">
                {pkg.conditions.map((condition) => (
                  <li
                    key={condition}
                    className="flex gap-2 text-xs leading-5 text-brand-muted"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold" />
                    {buyerFriendlyCondition(condition)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section
            id="refine"
            className="scroll-mt-24 rounded-[24px] border border-brand-green/15 bg-brand-green-soft/[0.45] p-5"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-green text-white">
                <Icon name="sparkles" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold">
                  Tinh chỉnh linh hoạt
                </p>
                <h2 className="mt-1 text-lg font-bold text-brand-ink">
                  Bạn muốn thay đổi điều gì?
                </h2>
              </div>
            </div>
            <p className="mb-4 mt-3 text-xs leading-5 text-brand-muted">
              Mô tả tự nhiên; hệ thống sẽ dựng lại dịch vụ phù hợp và tính lại chi phí.
            </p>
            <ReviseBox packageId={pkg.id} />
          </section>

          <section className="rounded-[24px] bg-brand-green p-5 text-white shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold">
              Bước tiếp theo
            </p>
            <h2 className="mt-1 text-lg font-bold">Sẵn sàng gửi yêu cầu?</h2>
            <p className="mb-4 mt-2 text-xs leading-5 text-white/[0.7]">
              Chưa phát sinh thanh toán. Sales sẽ liên hệ để kiểm tra chỗ và xác nhận giá.
            </p>
            <BookingButton
              tourPackageId={pkg.id}
              label="Gửi yêu cầu đặt dịch vụ"
              size="lg"
              variant="secondary"
              className="w-full"
            />
          </section>
        </aside>
      </div>
    </div>
  );
}
