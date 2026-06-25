import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AIMascot } from "@/components/brand/AIMascot";
import { Badge, bookingStatusTone } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  ROUTES,
} from "@/lib/constants";
import { cn, formatVND } from "@/lib/utils";
import type {
  BookingRequest,
  BookingStatus,
  PaymentStatus,
  TourPackage,
  TripRequest,
} from "@/types";

export const metadata: Metadata = {
  title: "Yêu cầu của tôi — NiBiGo AI Travel Platform",
};
export const dynamic = "force-dynamic";

type FilterKey = "all" | "active" | "confirmed" | "completed" | "cancelled";

const FILTERS: { value: FilterKey; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Đang xử lý" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Đã hủy" },
];

const ACTIVE_STATUSES: BookingStatus[] = [
  "new",
  "contacted",
  "checking_availability",
  "waiting_payment",
];

const STATUS_CONTEXT: Record<
  BookingStatus,
  { title: string; next: string; icon: IconName }
> = {
  new: {
    title: "Yêu cầu đã được tiếp nhận",
    next: "Tiếp theo: tư vấn viên xem lại hành trình và liên hệ với bạn.",
    icon: "check",
  },
  contacted: {
    title: "Đang trao đổi với bạn",
    next: "Bạn có thể bổ sung mong muốn trước khi dịch vụ được xác nhận.",
    icon: "headset",
  },
  checking_availability: {
    title: "Đang kiểm tra tình trạng dịch vụ",
    next: "Giá và chỗ trống đang được kiểm tra lại theo ngày khởi hành.",
    icon: "search",
  },
  waiting_payment: {
    title: "Đang chờ bước thanh toán",
    next: "Chỉ thanh toán sau khi bạn đã xem và đồng ý thông tin cuối cùng.",
    icon: "wallet",
  },
  confirmed: {
    title: "Dịch vụ đã được xác nhận",
    next: "Thông tin đã được chốt. Hãy xem chi tiết để kiểm tra lại hành trình.",
    icon: "shield",
  },
  completed: {
    title: "Hành trình đã hoàn tất",
    next: "Cảm ơn bạn đã đồng hành. Thông tin vẫn được lưu để bạn xem lại.",
    icon: "sparkles",
  },
  cancelled: {
    title: "Yêu cầu đã dừng xử lý",
    next: "Hành trình cũ vẫn được giữ lại nếu bạn muốn chỉnh sửa và gửi yêu cầu mới.",
    icon: "x",
  },
};

function matchesFilter(status: BookingStatus, filter: FilterKey) {
  if (filter === "all") return true;
  if (filter === "active") return ACTIVE_STATUSES.includes(status);
  return status === filter;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Ngày đi linh hoạt";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(`${value}T00:00:00+07:00`));
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const requestedFilter = Array.isArray(searchParams?.status)
    ? searchParams?.status[0]
    : searchParams?.status;
  const filter = FILTERS.some((item) => item.value === requestedFilter)
    ? (requestedFilter as FilterKey)
    : "all";

  const supabase = createClient();
  const { data: bookingData } = await supabase
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false });
  const bookings = (bookingData as BookingRequest[] | null) ?? [];

  const packageIds = Array.from(new Set(bookings.map((booking) => booking.tour_package_id)));
  const tripIds = Array.from(new Set(bookings.map((booking) => booking.trip_request_id)));
  const [{ data: packageData }, { data: tripData }] = await Promise.all([
    packageIds.length
      ? supabase.from("tour_packages").select("*").in("id", packageIds)
      : Promise.resolve({ data: [] }),
    tripIds.length
      ? supabase.from("trip_requests").select("*").in("id", tripIds)
      : Promise.resolve({ data: [] }),
  ]);
  const packages = (packageData as TourPackage[] | null) ?? [];
  const trips = (tripData as TripRequest[] | null) ?? [];
  const packageById = new Map(packages.map((pkg) => [pkg.id, pkg]));
  const tripById = new Map(trips.map((trip) => [trip.id, trip]));
  const visibleBookings = bookings.filter((booking) =>
    matchesFilter(booking.status, filter),
  );

  const counts: Record<FilterKey, number> = {
    all: bookings.length,
    active: bookings.filter((booking) => ACTIVE_STATUSES.includes(booking.status)).length,
    confirmed: bookings.filter((booking) => booking.status === "confirmed").length,
    completed: bookings.filter((booking) => booking.status === "completed").length,
    cancelled: bookings.filter((booking) => booking.status === "cancelled").length,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <section className="overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-card">
        <div className="grid items-center lg:grid-cols-[1fr_260px]">
          <div className="px-6 py-8 sm:px-9 sm:py-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
              Theo dõi yêu cầu
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-brand-ink sm:text-4xl">
              Mọi hành trình đang chờ bạn quyết định.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-muted sm:text-base">
              Xem yêu cầu đang ở bước nào, chi phí dự kiến và điều gì cần xác nhận trước khi bạn
              tiếp tục. Gửi yêu cầu không đồng nghĩa với đã đặt dịch vụ.
            </p>
          </div>
          <div className="hidden h-full place-items-center bg-brand-green-soft/[0.5] lg:grid">
            <AIMascot state="default" size="lg" className="!h-48 !w-48" />
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["active", "Đang xử lý", "clock", "Cần theo dõi bước tiếp theo"],
          ["confirmed", "Đã xác nhận", "shield", "Dịch vụ đã được kiểm tra"],
          ["completed", "Hoàn tất", "check", "Hành trình đã kết thúc"],
          ["cancelled", "Đã hủy", "x", "Không còn được xử lý"],
        ].map(([key, label, icon, helper]) => (
          <Link
            key={key}
            href={`${ROUTES.bookings}?status=${key}`}
            className={cn(
              "rounded-[22px] border bg-white p-4 shadow-card transition-colors hover:border-brand-green/20",
              filter === key ? "border-brand-green/30 bg-brand-green-soft/[0.45]" : "border-black/5",
            )}
          >
            <div className="flex items-start justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-green-soft text-brand-green">
                <Icon name={icon as IconName} className="h-5 w-5" />
              </span>
              <strong className="text-2xl text-brand-green">{counts[key as FilterKey]}</strong>
            </div>
            <p className="mt-4 text-sm font-bold text-brand-ink">{label}</p>
            <p className="mt-1 text-[11px] leading-5 text-brand-muted">{helper}</p>
          </Link>
        ))}
      </section>

      <section>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {FILTERS.map((item) => (
            <Link
              key={item.value}
              href={
                item.value === "all"
                  ? ROUTES.bookings
                  : `${ROUTES.bookings}?status=${item.value}`
              }
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-colors",
                filter === item.value
                  ? "border-brand-green bg-brand-green text-white"
                  : "border-black/10 bg-white text-brand-muted hover:border-brand-green/25 hover:text-brand-green",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px]",
                  filter === item.value ? "bg-white/15" : "bg-black/5",
                )}
              >
                {counts[item.value]}
              </span>
            </Link>
          ))}
        </div>

        {visibleBookings.length === 0 ? (
          <div className="mt-4 rounded-[28px] border border-dashed border-brand-green/20 bg-white p-8 text-center shadow-card sm:p-10">
            <AIMascot state="thinking" size="lg" className="mx-auto" />
            <h2 className="mt-3 text-xl font-bold text-brand-ink">
              Chưa có yêu cầu trong nhóm này
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-brand-muted">
              Bạn có thể xem các nhóm trạng thái khác hoặc tiếp tục chỉnh hành trình trước khi gửi
              yêu cầu tư vấn.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <ButtonLink href={ROUTES.bookings} variant="outline">
                Xem tất cả yêu cầu
              </ButtonLink>
              <ButtonLink href={ROUTES.plan}>Lên kế hoạch mới</ButtonLink>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {visibleBookings.map((booking) => {
              const pkg = packageById.get(booking.tour_package_id);
              const trip = tripById.get(booking.trip_request_id);
              const context = STATUS_CONTEXT[booking.status];
              const paymentStatus = booking.payment_status ?? "unpaid";

              return (
                <article
                  key={booking.id}
                  className="flex min-h-[350px] flex-col rounded-[26px] border border-black/5 bg-white p-5 shadow-card sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold">
                        {booking.code}
                      </p>
                      <h2 className="mt-2 line-clamp-2 text-xl font-bold leading-snug text-brand-ink">
                        {pkg?.name ?? "Hành trình của bạn"}
                      </h2>
                    </div>
                    <Badge
                      tone={bookingStatusTone[booking.status]}
                      className="shrink-0 px-3 py-1 font-bold"
                    >
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </Badge>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-brand-cream/[0.65] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                        Khởi hành
                      </p>
                      <p className="mt-1 text-sm font-bold text-brand-ink">
                        {formatDate(trip?.start_date)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-brand-cream/[0.65] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                        Chi phí dự kiến
                      </p>
                      <p className="mt-1 text-sm font-bold text-brand-green">
                        {formatVND(booking.total_price)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3 rounded-[18px] border border-black/5 p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-green-soft text-brand-green">
                      <Icon name={context.icon} className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-brand-ink">{context.title}</p>
                      <p className="mt-1 text-xs leading-5 text-brand-muted">{context.next}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-brand-muted">
                    <span>Gửi lúc {formatCreatedAt(booking.created_at)}</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-2.5 py-1">
                      <Icon name="wallet" className="h-3.5 w-3.5" />
                      {PAYMENT_STATUS_LABELS[paymentStatus as PaymentStatus]}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-black/5 pt-5">
                    <span className="text-[11px] text-brand-muted">
                      {trip ? `${trip.num_days}N${trip.num_nights}Đ · ${trip.num_people} người` : ""}
                    </span>
                    <Link
                      href={ROUTES.booking(booking.code)}
                      className="inline-flex items-center gap-2 text-sm font-bold text-brand-green hover:underline"
                    >
                      Xem chi tiết
                      <Icon name="arrow-right" className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
