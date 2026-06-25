import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge, bookingStatusTone } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { calculateSalesPriority } from "@/lib/sales/priority";
import { cn, formatVND, formatVNDShort } from "@/lib/utils";
import {
  BOOKING_STATUS_LABELS,
  ROUTES,
} from "@/lib/constants";
import type {
  AvailabilityStatus,
  BookingFollowUp,
  BookingRequest,
  BookingStatusLog,
  TourPackage,
  TripRequest,
} from "@/types";
import { FOLLOW_UP_TYPE_LABELS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sales Dashboard — NiBiGo AI Travel Platform",
};
export const dynamic = "force-dynamic";

type BookingRow = BookingRequest & { updated_at?: string };
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

const priorityTone = {
  urgent: "border-status-soldout/20 bg-status-soldout/10 text-status-soldout",
  high: "border-brand-gold/25 bg-brand-gold-soft text-[#9f6818]",
  normal: "border-black/5 bg-black/[0.035] text-brand-muted",
} as const;

function formatDate(date: string | null | undefined) {
  if (!date) return "Chưa chốt ngày";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(`${date}T00:00:00+07:00`));
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(date));
}

function isToday(date: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
  return formatter.format(new Date(date)) === formatter.format(new Date());
}

function vnDateKey(date: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(
    new Date(date),
  );
}

function formatDueTime(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(date));
}

export default async function SalesDashboardPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const query = (
    Array.isArray(searchParams?.q) ? searchParams?.q[0] : searchParams?.q
  )
    ?.trim()
    .toLowerCase();
  const assignedOnly =
    (Array.isArray(searchParams?.assigned)
      ? searchParams?.assigned[0]
      : searchParams?.assigned) === "me";
  const selectedBookingId = Array.isArray(searchParams?.booking)
    ? searchParams?.booking[0]
    : searchParams?.booking;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: bookingData }, { data: logData }, { data: followupData }] =
    await Promise.all([
      supabase
        .from("booking_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(120),
      supabase
        .from("booking_status_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("booking_followups")
        .select("*")
        .eq("status", "open")
        .order("due_at", { ascending: true })
        .limit(20),
    ]);
  const bookings = (bookingData as BookingRow[] | null) ?? [];
  const logs = (logData as BookingStatusLog[] | null) ?? [];
  const openFollowups = (followupData as BookingFollowUp[] | null) ?? [];

  const tripIds = Array.from(new Set(bookings.map((booking) => booking.trip_request_id)));
  const packageIds = Array.from(new Set(bookings.map((booking) => booking.tour_package_id)));

  const [
    { data: tripData },
    { data: packageData },
    { data: itemRiskData },
  ] = await Promise.all([
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
  const bookingById = new Map(bookings.map((booking) => [booking.id, booking]));
  const riskyPackageIds = new Set(
    riskRows
      .filter((row) => {
        const products = Array.isArray(row.products) ? row.products : [row.products];
        return products.some(
          (product) =>
            product &&
            ["limited", "sold_out", "need_confirmation"].includes(
              product.availability_status,
            ),
        );
      })
      .map((row) => row.tour_package_id),
  );

  const filteredBookings = bookings.filter((booking) => {
    if (assignedOnly && booking.assigned_sales_id !== user?.id) return false;
    if (!query) return true;
    return [booking.code, booking.contact_name, booking.contact_phone]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const prioritized = filteredBookings
    .filter((booking) => ACTIVE_STATUSES.includes(booking.status))
    .map((booking) => {
      const trip = tripById.get(booking.trip_request_id);
      const pkg = packageById.get(booking.tour_package_id);
      return {
        booking,
        trip,
        pkg,
        priority: calculateSalesPriority({
          booking,
          trip,
          pkg,
          hasAvailabilityRisk: riskyPackageIds.has(booking.tour_package_id),
        }),
      };
    })
    .sort(
      (a, b) =>
        b.priority.score - a.priority.score ||
        new Date(a.booking.created_at).getTime() -
          new Date(b.booking.created_at).getTime(),
    );

  const selectedBooking = selectedBookingId
    ? bookingById.get(selectedBookingId)
    : undefined;
  const selectedTrip = selectedBooking
    ? tripById.get(selectedBooking.trip_request_id)
    : undefined;
  const selectedPackage = selectedBooking
    ? packageById.get(selectedBooking.tour_package_id)
    : undefined;

  const contactedBookings = prioritized
    .filter(({ booking }) => booking.status === "contacted")
    .slice(0, 5);
  const upcomingBookings = prioritized
    .filter(({ trip }) => trip?.start_date)
    .sort((a, b) =>
      String(a.trip?.start_date).localeCompare(String(b.trip?.start_date)),
    )
    .slice(0, 5);

  const todayKey = vnDateKey(new Date().toISOString());
  const dueFollowups = openFollowups
    .filter((followup) => {
      const booking = bookingById.get(followup.booking_request_id);
      if (!booking) return false;
      if (assignedOnly && booking.assigned_sales_id !== user?.id) return false;
      return vnDateKey(followup.due_at) <= todayKey; // đến hạn hôm nay hoặc trễ
    })
    .slice(0, 6)
    .map((followup) => ({
      followup,
      booking: bookingById.get(followup.booking_request_id) as BookingRow,
      overdue: vnDateKey(followup.due_at) < todayKey,
    }));

  const newToday = bookings.filter(
    (booking) => booking.status === "new" && isToday(booking.created_at),
  ).length;
  const unassigned = bookings.filter(
    (booking) =>
      ACTIVE_STATUSES.includes(booking.status) && !booking.assigned_sales_id,
  ).length;
  const checking = bookings.filter(
    (booking) => booking.status === "checking_availability",
  ).length;
  const confirmed = bookings.filter(
    (booking) => booking.status === "confirmed",
  ).length;
  const highValue = bookings.filter(
    (booking) =>
      ACTIVE_STATUSES.includes(booking.status) && booking.total_price >= 10_000_000,
  ).length;

  const stats: {
    label: string;
    value: number;
    helper: string;
    icon: IconName;
    tone: string;
  }[] = [
    {
      label: "Mới hôm nay",
      value: newToday,
      helper: "Chưa liên hệ",
      icon: "plus",
      tone: "bg-[#e8f2ec] text-brand-green",
    },
    {
      label: "Chưa phân công",
      value: unassigned,
      helper: "Cần người nhận",
      icon: "users",
      tone: "bg-[#eef1f7] text-[#526d91]",
    },
    {
      label: "Đang kiểm tra",
      value: checking,
      helper: "Dịch vụ hoặc giá",
      icon: "search",
      tone: "bg-brand-gold-soft text-[#9f6818]",
    },
    {
      label: "Đã xác nhận",
      value: confirmed,
      helper: "Đang hoạt động",
      icon: "shield",
      tone: "bg-[#e8f2ec] text-brand-green",
    },
    {
      label: "Lead giá trị cao",
      value: highValue,
      helper: "Từ 10 triệu",
      icon: "wallet",
      tone: "bg-[#f2ebf7] text-[#77528f]",
    },
  ];

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
            Sales Dashboard
          </p>
          <h1 className="mt-1 text-3xl font-bold text-brand-ink">
            Hôm nay cần xử lý gì?
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
            Booking được sắp theo ngày đi, mức độ khẩn cấp và những điều còn cần xác nhận.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(query || assignedOnly) && (
            <Link
              href={ROUTES.salesDashboard}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-bold text-brand-muted hover:text-brand-green"
            >
              <Icon name="x" className="h-4 w-4" />
              Xóa bộ lọc
            </Link>
          )}
          <span className="rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-brand-muted shadow-card">
            {new Intl.DateTimeFormat("vi-VN", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              timeZone: "Asia/Ho_Chi_Minh",
            }).format(new Date())}
          </span>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-[22px] border border-black/5 bg-white p-4 shadow-card"
          >
            <div className="flex items-start justify-between gap-3">
              <span className={cn("grid h-10 w-10 place-items-center rounded-2xl", stat.tone)}>
                <Icon name={stat.icon} className="h-5 w-5" />
              </span>
              <strong className="text-3xl leading-none text-brand-ink">{stat.value}</strong>
            </div>
            <p className="mt-4 text-sm font-bold text-brand-ink">{stat.label}</p>
            <p className="mt-1 text-[11px] text-brand-muted">{stat.helper}</p>
          </article>
        ))}
      </section>

      {selectedBooking && (
        <section
          id="booking-preview"
          className="scroll-mt-24 rounded-[26px] border border-brand-green/20 bg-white p-5 shadow-card sm:p-6"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-brand-gold">
                  Preview booking
                </span>
                <Badge tone={bookingStatusTone[selectedBooking.status]}>
                  {BOOKING_STATUS_LABELS[selectedBooking.status]}
                </Badge>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-brand-ink">
                {selectedBooking.code} · {selectedBooking.contact_name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                {selectedPackage?.name ?? "Chưa tải được tên gói"} ·{" "}
                {selectedTrip
                  ? `${selectedTrip.num_days}N${selectedTrip.num_nights}Đ, ${selectedTrip.num_people} người`
                  : "Chưa tải được nhu cầu chuyến đi"}
              </p>
              {selectedBooking.ai_sales_note && (
                <div className="mt-4 rounded-2xl bg-brand-green-soft/[0.55] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-green">
                    Ghi chú hỗ trợ tư vấn
                  </p>
                  <p className="mt-2 text-sm leading-6 text-brand-ink">
                    {selectedBooking.ai_sales_note}
                  </p>
                </div>
              )}
            </div>
            <div className="grid min-w-64 grid-cols-2 gap-3">
              <div className="rounded-2xl bg-brand-cream/[0.65] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Ngày đi
                </p>
                <p className="mt-1 text-sm font-bold text-brand-ink">
                  {formatDate(selectedTrip?.start_date)}
                </p>
              </div>
              <div className="rounded-2xl bg-brand-cream/[0.65] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Tổng dự kiến
                </p>
                <p className="mt-1 text-sm font-bold text-brand-green">
                  {formatVND(selectedBooking.total_price)}
                </p>
              </div>
              <a
                href={`tel:${selectedBooking.contact_phone}`}
                className="col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-brand-green px-4 py-2.5 text-sm font-bold text-white"
              >
                <Icon name="headset" className="h-4 w-4" />
                Gọi {selectedBooking.contact_phone}
              </a>
              <Link
                href={ROUTES.salesBooking(selectedBooking.id)}
                className="col-span-2 inline-flex items-center justify-center gap-2 rounded-full border border-brand-green/25 px-4 py-2.5 text-sm font-bold text-brand-green transition-colors hover:bg-brand-green-soft"
              >
                Mở hồ sơ đầy đủ
                <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,.5fr)]">
        <div className="overflow-hidden rounded-[26px] border border-black/5 bg-white shadow-card">
          <header className="flex items-end justify-between gap-4 border-b border-black/5 px-5 py-4 sm:px-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-gold">
                Priority Queue
              </p>
              <h2 className="mt-1 text-xl font-bold text-brand-ink">
                Booking nên xử lý trước
              </h2>
            </div>
            <span className="text-xs font-semibold text-brand-muted">
              {prioritized.length} đang hoạt động
            </span>
          </header>

          {prioritized.length === 0 ? (
            <div className="grid min-h-72 place-items-center p-8 text-center">
              <div>
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-green-soft text-brand-green">
                  <Icon name="check" className="h-5 w-5" />
                </span>
                <p className="mt-3 font-bold text-brand-ink">
                  Không có booking cần xử lý trong bộ lọc này
                </p>
                <p className="mt-1 text-sm text-brand-muted">
                  Booking mới sẽ xuất hiện ở đây khi Buyer gửi yêu cầu.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {prioritized.slice(0, 8).map(({ booking, trip, pkg, priority }) => (
                <article
                  key={booking.id}
                  className="grid gap-4 px-5 py-4 transition-colors hover:bg-brand-cream/[0.4] sm:grid-cols-[1.15fr_.85fr_auto] sm:items-center sm:px-6"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm tracking-wide text-brand-ink">
                        {booking.code}
                      </strong>
                      <Badge tone={bookingStatusTone[booking.status]}>
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm font-bold text-brand-ink">
                      {booking.contact_name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-brand-muted">
                      {pkg?.name ?? "Chưa tải được gói"} · {trip?.num_people ?? "—"} người
                    </p>
                  </div>

                  <div>
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold",
                        priorityTone[priority.level],
                      )}
                    >
                      {priority.label}
                    </span>
                    <p className="mt-2 line-clamp-1 text-xs text-brand-muted">
                      {priority.reasons.slice(0, 2).join(" · ")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-green">
                        {formatVNDShort(booking.total_price)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-brand-muted">
                        {formatDate(trip?.start_date)}
                      </p>
                    </div>
                    <Link
                      href={`${ROUTES.salesDashboard}?booking=${booking.id}#booking-preview`}
                      className="grid h-9 w-9 place-items-center rounded-full bg-brand-green-soft text-brand-green transition-colors hover:bg-brand-green hover:text-white"
                      aria-label={`Xem nhanh ${booking.code}`}
                    >
                      <Icon name="chevron-right" className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <section className="rounded-[26px] border border-brand-gold/20 bg-brand-gold-soft/[0.3] p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#9f6818]">
                  Follow-up đến hạn
                </p>
                <h2 className="mt-1 text-lg font-bold text-brand-ink">
                  Cần liên hệ lại hôm nay
                </h2>
              </div>
              <Icon name="bell" className="h-5 w-5 text-[#9f6818]" />
            </div>

            {dueFollowups.length === 0 ? (
              <p className="mt-5 rounded-2xl bg-white/70 p-4 text-sm leading-6 text-brand-muted">
                Không có follow-up nào đến hạn. 🎉
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {dueFollowups.map(({ followup, booking, overdue }) => (
                  <Link
                    key={followup.id}
                    href={ROUTES.salesBooking(booking.id)}
                    className="block rounded-2xl border border-black/5 bg-white p-3 transition-colors hover:border-brand-gold/30"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <strong className="truncate text-xs text-brand-ink">
                        {booking.code} · {booking.contact_name}
                      </strong>
                      {overdue && (
                        <span className="shrink-0 rounded-full bg-status-soldout/10 px-2 py-0.5 text-[9px] font-bold text-status-soldout">
                          Trễ hạn
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-1 text-[11px] text-brand-muted">
                      {FOLLOW_UP_TYPE_LABELS[followup.follow_up_type]} · {followup.content}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-[#9f6818]">
                      Hẹn: {formatDueTime(followup.due_at)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[26px] border border-black/5 bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-gold">
                  Tiếp tục trao đổi
                </p>
                <h2 className="mt-1 text-lg font-bold text-brand-ink">
                  Khách đã liên hệ nhưng chưa chốt
                </h2>
              </div>
              <Icon name="headset" className="h-5 w-5 text-brand-green" />
            </div>

            {contactedBookings.length === 0 ? (
              <p className="mt-5 rounded-2xl bg-brand-cream/[0.65] p-4 text-sm leading-6 text-brand-muted">
                Chưa có booking ở trạng thái cần tiếp tục trao đổi.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {contactedBookings.map(({ booking, trip }) => (
                  <Link
                    key={booking.id}
                    href={ROUTES.salesBooking(booking.id)}
                    className="flex items-center gap-3 rounded-2xl border border-black/5 p-3 transition-colors hover:border-brand-green/20 hover:bg-brand-green-soft/[0.35]"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-green-soft text-brand-green">
                      <Icon name="user" className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-xs text-brand-ink">
                        {booking.contact_name}
                      </strong>
                      <span className="mt-0.5 block text-[10px] text-brand-muted">
                        Đi {formatDate(trip?.start_date)}
                      </span>
                    </span>
                    <Icon name="chevron-right" className="h-4 w-4 text-brand-muted" />
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[26px] bg-brand-green p-5 text-white shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-gold">
              Việc nên làm tiếp
            </p>
            <h2 className="mt-1 text-lg font-bold">
              {prioritized[0]
                ? `Ưu tiên ${prioritized[0].booking.contact_name}`
                : "Queue đang được kiểm soát"}
            </h2>
            <p className="mt-2 text-xs leading-6 text-white/[0.72]">
              {prioritized[0]
                ? prioritized[0].priority.reasons.join(". ") + "."
                : "Hiện chưa có booking hoạt động cần cảnh báo."}
            </p>
            {prioritized[0] && (
              <Link
                href={ROUTES.salesBooking(prioritized[0].booking.id)}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-gold px-4 py-2.5 text-xs font-bold text-brand-ink"
              >
                Mở booking cần ưu tiên
                <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
            )}
          </section>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[26px] border border-black/5 bg-white p-5 shadow-card sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-gold">
                Ngày đi sắp tới
              </p>
              <h2 className="mt-1 text-lg font-bold text-brand-ink">
                Booking cần chuẩn bị trước
              </h2>
            </div>
            <Icon name="calendar" className="h-5 w-5 text-brand-green" />
          </div>
          <div className="mt-4 divide-y divide-black/5">
            {upcomingBookings.length === 0 ? (
              <p className="py-5 text-sm text-brand-muted">Chưa có ngày đi sắp tới.</p>
            ) : (
              upcomingBookings.map(({ booking, trip }) => (
                <div key={booking.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-cream text-xs font-bold text-brand-green">
                    {trip?.start_date?.slice(8, 10) ?? "—"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-xs text-brand-ink">
                      {booking.code} · {booking.contact_name}
                    </strong>
                    <span className="mt-0.5 block text-[10px] text-brand-muted">
                      {formatDate(trip?.start_date)}
                    </span>
                  </span>
                  <Badge tone={bookingStatusTone[booking.status]}>
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[26px] border border-black/5 bg-white p-5 shadow-card sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-gold">
                Hoạt động gần đây
              </p>
              <h2 className="mt-1 text-lg font-bold text-brand-ink">
                Thay đổi trạng thái booking
              </h2>
            </div>
            <Icon name="clock" className="h-5 w-5 text-brand-green" />
          </div>
          <div className="mt-4 space-y-0">
            {logs.length === 0 ? (
              <p className="py-5 text-sm text-brand-muted">Chưa có hoạt động được ghi nhận.</p>
            ) : (
              logs.slice(0, 6).map((log, index) => {
                const booking = bookingById.get(log.booking_request_id);
                return (
                  <div key={log.id} className="relative flex gap-3 pb-4 last:pb-0">
                    {index < Math.min(logs.length, 6) - 1 && (
                      <span className="absolute left-[15px] top-8 h-[calc(100%-14px)] w-px bg-brand-green-soft" />
                    )}
                    <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-green-soft text-brand-green">
                      <Icon
                        name={log.to_status === "cancelled" ? "x" : "check"}
                        className="h-3.5 w-3.5"
                      />
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <strong className="block truncate text-xs text-brand-ink">
                        {booking?.code ?? "Booking"} →{" "}
                        {BOOKING_STATUS_LABELS[log.to_status]}
                      </strong>
                      <span className="mt-0.5 block text-[10px] leading-4 text-brand-muted">
                        {log.note ?? "Cập nhật trạng thái"} · {formatDateTime(log.created_at)}
                      </span>
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
