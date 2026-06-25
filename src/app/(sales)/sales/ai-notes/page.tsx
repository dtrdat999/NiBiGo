import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { calculateSalesPriority } from "@/lib/sales/priority";
import { buildLeadInsight } from "@/lib/sales/lead-insight";
import { cn, formatVNDShort } from "@/lib/utils";
import { BOOKING_STATUS_LABELS, ROUTES } from "@/lib/constants";
import type {
  AvailabilityStatus,
  BookingRequest,
  TourPackage,
  TripRequest,
} from "@/types";

export const metadata: Metadata = {
  title: "AI Sales Notes — NiBiGo AI Travel Platform",
};
export const dynamic = "force-dynamic";

type PackageItemRiskRow = {
  tour_package_id: string;
  products:
    | { availability_status: AvailabilityStatus }
    | { availability_status: AvailabilityStatus }[]
    | null;
};

const ACTIVE_STATUSES: BookingRequest["status"][] = [
  "new",
  "contacted",
  "checking_availability",
  "waiting_payment",
];

const FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "risk", label: "Có rủi ro" },
  { key: "mine", label: "Của tôi" },
] as const;

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SalesAiNotesPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const filter = param(searchParams?.filter) ?? "all";
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: bookingData } = await supabase
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(120);
  const bookings = (bookingData as BookingRequest[] | null) ?? [];

  const tripIds = Array.from(new Set(bookings.map((booking) => booking.trip_request_id)));
  const packageIds = Array.from(new Set(bookings.map((booking) => booking.tour_package_id)));

  const [{ data: tripData }, { data: packageData }, { data: itemRiskData }] =
    await Promise.all([
      tripIds.length
        ? supabase.from("trip_requests").select("*").in("id", tripIds)
        : Promise.resolve({ data: [] }),
      packageIds.length
        ? supabase.from("tour_packages").select("*").in("id", packageIds)
        : Promise.resolve({ data: [] }),
      packageIds.length
        ? supabase
            .from("tour_package_items")
            .select("tour_package_id, products(availability_status)")
            .in("tour_package_id", packageIds)
        : Promise.resolve({ data: [] }),
    ]);

  const trips = (tripData as TripRequest[] | null) ?? [];
  const packages = (packageData as TourPackage[] | null) ?? [];
  const riskRows = (itemRiskData as unknown as PackageItemRiskRow[] | null) ?? [];
  const tripById = new Map(trips.map((trip) => [trip.id, trip]));
  const packageById = new Map(packages.map((pkg) => [pkg.id, pkg]));
  const riskyPackageIds = new Set(
    riskRows
      .filter((row) => {
        const products = Array.isArray(row.products) ? row.products : [row.products];
        return products.some(
          (product) =>
            product &&
            ["limited", "sold_out", "need_confirmation"].includes(product.availability_status),
        );
      })
      .map((row) => row.tour_package_id),
  );

  const leads = bookings
    .filter((booking) => ACTIVE_STATUSES.includes(booking.status))
    .filter((booking) => (filter === "mine" ? booking.assigned_sales_id === user?.id : true))
    .map((booking) => {
      const trip = tripById.get(booking.trip_request_id);
      const pkg = packageById.get(booking.tour_package_id);
      const hasAvailabilityRisk = riskyPackageIds.has(booking.tour_package_id);
      return {
        booking,
        trip,
        pkg,
        insight: buildLeadInsight({ booking, trip, pkg, hasAvailabilityRisk }),
        priority: calculateSalesPriority({ booking, trip, pkg, hasAvailabilityRisk }),
      };
    })
    .filter((lead) => (filter === "risk" ? lead.insight.riskFlags.length > 0 : true))
    .sort((a, b) => b.priority.score - a.priority.score);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
            AI Sales Notes
          </p>
          <h1 className="mt-1 text-3xl font-bold text-brand-ink">Hiểu lead trong 1 phút</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
            Lớp hỗ trợ phân tích: tóm tắt nhu cầu, cảnh báo rủi ro và gợi ý cách tư vấn. AI không
            tự xác nhận hay đổi trạng thái — quyết định vẫn là của bạn.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-white p-1">
          {FILTERS.map((tab) => {
            const active = filter === tab.key || (tab.key === "all" && filter === "all");
            const href =
              tab.key === "all" ? ROUTES.salesAiNotes : `${ROUTES.salesAiNotes}?filter=${tab.key}`;
            return (
              <Link
                key={tab.key}
                href={href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
                  active
                    ? "bg-brand-green text-white"
                    : "text-brand-muted hover:text-brand-ink",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </section>

      {leads.length === 0 ? (
        <div className="grid min-h-64 place-items-center rounded-[26px] border border-black/5 bg-white p-8 text-center shadow-card">
          <div>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-green-soft text-brand-green">
              <Icon name="sparkles" className="h-5 w-5" />
            </span>
            <p className="mt-3 font-bold text-brand-ink">Không có lead phù hợp bộ lọc</p>
            <p className="mt-1 text-sm text-brand-muted">
              Lead sẽ xuất hiện khi có booking đang hoạt động.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {leads.map(({ booking, trip, pkg, insight }) => (
            <article
              key={booking.id}
              className="flex flex-col rounded-[26px] border border-black/5 bg-white p-5 shadow-card sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm tracking-wide text-brand-ink">{booking.code}</strong>
                    <Badge tone={insight.buyingIntent.tone}>
                      Ý định: {insight.buyingIntent.label}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-base font-bold text-brand-ink">
                    {booking.contact_name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-brand-muted">
                    {pkg?.name ?? "Chưa rõ gói"} ·{" "}
                    {trip ? `${trip.num_people} người · ${trip.num_days}N${trip.num_nights}Đ` : "—"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <Badge tone={insight.budgetFit.tone}>{insight.budgetFit.label}</Badge>
                  <p className="mt-1.5 text-sm font-bold text-brand-green">
                    {formatVNDShort(booking.total_price)}
                  </p>
                </div>
              </div>

              <p className="mt-4 rounded-2xl bg-brand-green-soft/[0.4] p-3 text-sm leading-6 text-brand-ink">
                {insight.summary}
              </p>

              {insight.riskFlags.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">
                    Rủi ro cần lưu ý
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {insight.riskFlags.map((flag) => (
                      <span
                        key={flag.id}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          flag.severity === "high"
                            ? "bg-status-soldout/10 text-status-soldout"
                            : "bg-brand-gold-soft text-[#9f6818]",
                        )}
                      >
                        <Icon name="shield" className="h-3 w-3" />
                        {flag.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">
                  Gợi ý khi tư vấn
                </p>
                <ul className="mt-2 space-y-1.5">
                  {insight.talkingPoints.map((point) => (
                    <li key={point} className="flex gap-2 text-xs leading-5 text-brand-ink">
                      <Icon
                        name="check"
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-green"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {insight.upsell.length > 0 && (
                <div className="mt-3 rounded-2xl border border-brand-gold/20 bg-brand-gold-soft/[0.3] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9f6818]">
                    Cơ hội upsell / cross-sell
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {insight.upsell.map((idea) => (
                      <li key={idea} className="flex gap-2 text-xs leading-5 text-brand-ink">
                        <Icon name="sparkles" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-gold" />
                        {idea}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/5 pt-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">
                    Việc nên làm tiếp
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-brand-ink">
                    {insight.nextBestAction}
                  </p>
                </div>
                <Link
                  href={ROUTES.salesBooking(booking.id)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-green px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-green-dark"
                >
                  Mở booking
                  <Icon name="arrow-right" className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-3">
                <Badge tone="neutral">{BOOKING_STATUS_LABELS[booking.status]}</Badge>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
