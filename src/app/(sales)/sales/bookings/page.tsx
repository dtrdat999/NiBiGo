import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BookingQueueActions } from "@/components/sales/BookingQueueActions";
import { Badge, bookingStatusTone } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { calculateSalesPriority } from "@/lib/sales/priority";
import { cn, formatVND, formatVNDShort } from "@/lib/utils";
import {
  BOOKING_STATUS_LABELS,
  PACKAGE_TIER_LABELS,
  ROUTES,
} from "@/lib/constants";
import type {
  AvailabilityStatus,
  BookingRequest,
  BookingStatus,
  PackageTier,
  Profile,
  TourPackage,
  TripRequest,
} from "@/types";

export const metadata: Metadata = {
  title: "Booking Queue — NiBiGo AI Travel Platform",
};
export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;
type AssignmentFilter = "all" | "me" | "unassigned";
type RiskFilter = "all" | "risk" | "clear";
type AmountFilter = "all" | "under_5" | "5_10" | "10_plus";
type SortKey = "priority" | "travel_date" | "newest" | "amount_desc";

type PackageItemRiskRow = {
  tour_package_id: string;
  products:
    | { availability_status: AvailabilityStatus }
    | { availability_status: AvailabilityStatus }[]
    | null;
};

const STATUS_TABS: { value: "all" | BookingStatus; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "new", label: "Mới" },
  { value: "contacted", label: "Đã liên hệ" },
  { value: "checking_availability", label: "Cần xác nhận" },
  { value: "waiting_payment", label: "Chờ thanh toán" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Đã hủy" },
];

const PRIORITY_TONE = {
  urgent: "border-status-soldout/20 bg-status-soldout/10 text-status-soldout",
  high: "border-brand-gold/25 bg-brand-gold-soft text-[#9f6818]",
  normal: "border-black/5 bg-black/[0.035] text-brand-muted",
} as const;

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function validEnum<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
) {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function hrefWith(
  current: SearchParams | undefined,
  changes: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  Object.entries(current ?? {}).forEach(([key, value]) => {
    const first = Array.isArray(value) ? value[0] : value;
    if (first) params.set(key, first);
  });
  Object.entries(changes).forEach(([key, value]) => {
    if (value) params.set(key, value);
    else params.delete(key);
  });
  const query = params.toString();
  return query ? `${ROUTES.salesBookings}?${query}` : ROUTES.salesBookings;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Chưa chốt";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(`${value}T00:00:00+07:00`));
}

function formatDateTime(value: string | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

export default async function SalesBookingsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const query = single(searchParams?.q)?.trim().toLowerCase() ?? "";
  const status = validEnum(
    single(searchParams?.status),
    STATUS_TABS.map((tab) => tab.value),
    "all",
  );
  const assignment = validEnum<AssignmentFilter>(
    single(searchParams?.assignment),
    ["all", "me", "unassigned"],
    "all",
  );
  const risk = validEnum<RiskFilter>(
    single(searchParams?.risk),
    ["all", "risk", "clear"],
    "all",
  );
  const amount = validEnum<AmountFilter>(
    single(searchParams?.amount),
    ["all", "under_5", "5_10", "10_plus"],
    "all",
  );
  const tier = validEnum<"all" | PackageTier>(
    single(searchParams?.tier),
    ["all", "budget", "balanced", "premium"],
    "all",
  );
  const sort = validEnum<SortKey>(
    single(searchParams?.sort),
    ["priority", "travel_date", "newest", "amount_desc"],
    "priority",
  );
  const travelFrom = single(searchParams?.travel_from) ?? "";
  const travelTo = single(searchParams?.travel_to) ?? "";
  const createdFrom = single(searchParams?.created_from) ?? "";
  const createdTo = single(searchParams?.created_to) ?? "";
  const previewId = single(searchParams?.preview);
  const requestedPage = Math.max(1, Number(single(searchParams?.page)) || 1);
  const pageSize = 20;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: currentProfileData } = user
    ? await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .eq("id", user.id)
        .single()
    : { data: null };
  const currentProfile = currentProfileData as Pick<
    Profile,
    "id" | "full_name" | "email" | "role"
  > | null;

  const [{ data: bookingData }, { data: salesProfileData }] = await Promise.all([
    supabase
      .from("booking_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .in("role", ["sales", "admin"]),
  ]);
  const bookings = (bookingData as BookingRequest[] | null) ?? [];
  const salesProfiles =
    (salesProfileData as Pick<
      Profile,
      "id" | "full_name" | "email" | "role"
    >[] | null) ?? [];

  const tripIds = Array.from(new Set(bookings.map((booking) => booking.trip_request_id)));
  const packageIds = Array.from(new Set(bookings.map((booking) => booking.tour_package_id)));
  const [{ data: tripData }, { data: packageData }, { data: riskData }] =
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
  const riskRows = (riskData as unknown as PackageItemRiskRow[] | null) ?? [];
  const tripById = new Map(trips.map((trip) => [trip.id, trip]));
  const packageById = new Map(packages.map((pkg) => [pkg.id, pkg]));
  const salesById = new Map(
    salesProfiles.map((profile) => [profile.id, profile]),
  );
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

  const statusCounts = Object.fromEntries(
    STATUS_TABS.map((tab) => [
      tab.value,
      tab.value === "all"
        ? bookings.length
        : bookings.filter((booking) => booking.status === tab.value).length,
    ]),
  ) as Record<(typeof STATUS_TABS)[number]["value"], number>;

  const rows = bookings
    .map((booking) => {
      const trip = tripById.get(booking.trip_request_id);
      const pkg = packageById.get(booking.tour_package_id);
      const hasRisk = riskyPackageIds.has(booking.tour_package_id);
      return {
        booking,
        trip,
        pkg,
        hasRisk,
        priority: calculateSalesPriority({
          booking,
          trip,
          pkg,
          hasAvailabilityRisk: hasRisk,
        }),
      };
    })
    .filter(({ booking, trip, pkg, hasRisk }) => {
      if (
        query &&
        ![booking.code, booking.contact_name, booking.contact_phone]
          .join(" ")
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }
      if (status !== "all" && booking.status !== status) return false;
      if (assignment === "me" && booking.assigned_sales_id !== user?.id) return false;
      if (assignment === "unassigned" && booking.assigned_sales_id) return false;
      if (risk === "risk" && !hasRisk) return false;
      if (risk === "clear" && hasRisk) return false;
      if (tier !== "all" && pkg?.tier !== tier) return false;
      if (amount === "under_5" && booking.total_price >= 5_000_000) return false;
      if (
        amount === "5_10" &&
        (booking.total_price < 5_000_000 || booking.total_price >= 10_000_000)
      ) {
        return false;
      }
      if (amount === "10_plus" && booking.total_price < 10_000_000) return false;
      if (travelFrom && (!trip?.start_date || trip.start_date < travelFrom)) return false;
      if (travelTo && (!trip?.start_date || trip.start_date > travelTo)) return false;
      const createdDate = booking.created_at.slice(0, 10);
      if (createdFrom && createdDate < createdFrom) return false;
      if (createdTo && createdDate > createdTo) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "travel_date") {
        return String(a.trip?.start_date ?? "9999-12-31").localeCompare(
          String(b.trip?.start_date ?? "9999-12-31"),
        );
      }
      if (sort === "newest") {
        return (
          new Date(b.booking.created_at).getTime() -
          new Date(a.booking.created_at).getTime()
        );
      }
      if (sort === "amount_desc") {
        return b.booking.total_price - a.booking.total_price;
      }
      return (
        b.priority.score - a.priority.score ||
        new Date(a.booking.created_at).getTime() -
          new Date(b.booking.created_at).getTime()
      );
    });

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const previewRow = previewId
    ? rows.find(({ booking }) => booking.id === previewId) ??
      bookings
        .filter((booking) => booking.id === previewId)
        .map((booking) => {
          const trip = tripById.get(booking.trip_request_id);
          const pkg = packageById.get(booking.tour_package_id);
          const hasRisk = riskyPackageIds.has(booking.tour_package_id);
          return {
            booking,
            trip,
            pkg,
            hasRisk,
            priority: calculateSalesPriority({
              booking,
              trip,
              pkg,
              hasAvailabilityRisk: hasRisk,
            }),
          };
        })[0]
    : undefined;

  const activeFilters = [
    query,
    status !== "all" ? status : "",
    assignment !== "all" ? assignment : "",
    risk !== "all" ? risk : "",
    amount !== "all" ? amount : "",
    tier !== "all" ? tier : "",
    travelFrom,
    travelTo,
    createdFrom,
    createdTo,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
            Booking Queue
          </p>
          <h1 className="mt-1 text-3xl font-bold text-brand-ink">
            Chọn đúng booking để xử lý tiếp
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-brand-muted">
            Tìm theo mã, tên hoặc số điện thoại; sau đó lọc theo ngày đi, người phụ trách và rủi
            ro dịch vụ.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white px-4 py-2.5 text-xs font-bold text-brand-muted shadow-card">
            {rows.length} kết quả
          </span>
          <Link
            href={hrefWith(searchParams, { preview: undefined })}
            className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white text-brand-muted transition-colors hover:text-brand-green"
            title="Làm mới danh sách"
          >
            <Icon name="route" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={hrefWith(searchParams, {
                status: tab.value === "all" ? undefined : tab.value,
                page: undefined,
                preview: undefined,
              })}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-colors",
                status === tab.value
                  ? "border-brand-green bg-brand-green text-white"
                  : "border-black/10 bg-white text-brand-muted hover:border-brand-green/25 hover:text-brand-green",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px]",
                  status === tab.value ? "bg-white/15" : "bg-black/5",
                )}
              >
                {statusCounts[tab.value]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <form
        action={ROUTES.salesBookings}
        method="get"
        className="rounded-[24px] border border-black/5 bg-white p-4 shadow-card sm:p-5"
      >
        {status !== "all" && <input type="hidden" name="status" value={status} />}
        <div className="grid gap-3 xl:grid-cols-[minmax(240px,1.4fr)_repeat(4,minmax(145px,.65fr))_auto]">
          <label className="relative">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted"
            />
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Mã booking, tên khách, số điện thoại…"
              className="h-11 w-full rounded-xl border border-black/10 bg-brand-cream/[0.45] pl-10 pr-4 text-sm text-brand-ink outline-none focus:border-brand-green/30 focus:bg-white focus:ring-2 focus:ring-brand-green/10"
            />
          </label>

          <select
            name="assignment"
            defaultValue={assignment}
            className="h-11 rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold text-brand-ink outline-none focus:border-brand-green"
          >
            <option value="all">Mọi người phụ trách</option>
            <option value="me">Chỉ việc của tôi</option>
            <option value="unassigned">Chưa phân công</option>
          </select>

          <select
            name="risk"
            defaultValue={risk}
            className="h-11 rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold text-brand-ink outline-none focus:border-brand-green"
          >
            <option value="all">Mọi mức rủi ro</option>
            <option value="risk">Có dịch vụ cần kiểm tra</option>
            <option value="clear">Chưa thấy xung đột</option>
          </select>

          <select
            name="amount"
            defaultValue={amount}
            className="h-11 rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold text-brand-ink outline-none focus:border-brand-green"
          >
            <option value="all">Mọi mức giá</option>
            <option value="under_5">Dưới 5 triệu</option>
            <option value="5_10">Từ 5–10 triệu</option>
            <option value="10_plus">Từ 10 triệu</option>
          </select>

          <select
            name="tier"
            defaultValue={tier}
            className="h-11 rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold text-brand-ink outline-none focus:border-brand-green"
          >
            <option value="all">Mọi loại gói</option>
            <option value="budget">Tiết kiệm</option>
            <option value="balanced">Cân bằng</option>
            <option value="premium">Trải nghiệm</option>
          </select>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-green px-5 text-xs font-bold text-white hover:bg-brand-green-dark"
          >
            <Icon name="sliders" className="h-4 w-4" />
            Lọc
          </button>
        </div>

        <div className="mt-3 grid gap-3 border-t border-black/5 pt-3 sm:grid-cols-2 xl:grid-cols-5">
          <label>
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-brand-muted">
              Ngày đi từ
            </span>
            <input
              name="travel_from"
              type="date"
              lang="en-GB"
              defaultValue={travelFrom}
              className="h-10 w-full rounded-xl border border-black/10 px-3 text-xs text-brand-ink outline-none focus:border-brand-green"
            />
          </label>
          <label>
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-brand-muted">
              Ngày đi đến
            </span>
            <input
              name="travel_to"
              type="date"
              lang="en-GB"
              defaultValue={travelTo}
              className="h-10 w-full rounded-xl border border-black/10 px-3 text-xs text-brand-ink outline-none focus:border-brand-green"
            />
          </label>
          <label>
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-brand-muted">
              Tạo từ ngày
            </span>
            <input
              name="created_from"
              type="date"
              lang="en-GB"
              defaultValue={createdFrom}
              className="h-10 w-full rounded-xl border border-black/10 px-3 text-xs text-brand-ink outline-none focus:border-brand-green"
            />
          </label>
          <label>
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-brand-muted">
              Tạo đến ngày
            </span>
            <input
              name="created_to"
              type="date"
              lang="en-GB"
              defaultValue={createdTo}
              className="h-10 w-full rounded-xl border border-black/10 px-3 text-xs text-brand-ink outline-none focus:border-brand-green"
            />
          </label>
          <label>
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-brand-muted">
              Sắp xếp
            </span>
            <select
              name="sort"
              defaultValue={sort}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold text-brand-ink outline-none focus:border-brand-green"
            >
              <option value="priority">Ưu tiên xử lý</option>
              <option value="travel_date">Ngày đi gần nhất</option>
              <option value="newest">Mới tạo gần nhất</option>
              <option value="amount_desc">Giá trị cao nhất</option>
            </select>
          </label>
        </div>

        {activeFilters > 0 && (
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-black/5 pt-3">
            <span className="text-[11px] font-semibold text-brand-muted">
              Đang áp dụng {activeFilters} điều kiện lọc
            </span>
            <Link
              href={ROUTES.salesBookings}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-green hover:underline"
            >
              <Icon name="x" className="h-3.5 w-3.5" />
              Xóa tất cả
            </Link>
          </div>
        )}
      </form>

      {previewRow && (
        <section
          id="queue-preview"
          className="scroll-mt-24 rounded-[26px] border border-brand-green/20 bg-white p-5 shadow-card sm:p-6"
        >
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-brand-gold">
                  Xem nhanh booking
                </span>
                <Badge tone={bookingStatusTone[previewRow.booking.status]}>
                  {BOOKING_STATUS_LABELS[previewRow.booking.status]}
                </Badge>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[10px] font-bold",
                    PRIORITY_TONE[previewRow.priority.level],
                  )}
                >
                  {previewRow.priority.label}
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-brand-ink">
                {previewRow.booking.code} · {previewRow.booking.contact_name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                {previewRow.pkg?.name ?? "Chưa tải được gói"} ·{" "}
                {previewRow.trip
                  ? `${previewRow.trip.num_days}N${previewRow.trip.num_nights}Đ, ${previewRow.trip.num_people} người`
                  : "Chưa tải được nhu cầu chuyến đi"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {previewRow.priority.reasons.map((reason) => (
                  <span
                    key={reason}
                    className="rounded-full bg-brand-cream px-3 py-1.5 text-[11px] font-semibold text-brand-muted"
                  >
                    {reason}
                  </span>
                ))}
              </div>
              {previewRow.booking.ai_sales_note && (
                <div className="mt-4 rounded-2xl bg-brand-green-soft/[0.55] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-green">
                    Ghi chú hỗ trợ tư vấn
                  </p>
                  <p className="mt-2 text-sm leading-6 text-brand-ink">
                    {previewRow.booking.ai_sales_note}
                  </p>
                </div>
              )}
            </div>
            <div className="grid min-w-72 grid-cols-2 gap-3">
              <div className="rounded-2xl bg-brand-cream/[0.65] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Ngày đi
                </p>
                <p className="mt-1 text-sm font-bold text-brand-ink">
                  {formatDate(previewRow.trip?.start_date)}
                </p>
              </div>
              <div className="rounded-2xl bg-brand-cream/[0.65] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Tổng dự kiến
                </p>
                <p className="mt-1 text-sm font-bold text-brand-green">
                  {formatVND(previewRow.booking.total_price)}
                </p>
              </div>
              <a
                href={`tel:${previewRow.booking.contact_phone}`}
                className="col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-brand-green px-4 py-2.5 text-sm font-bold text-white"
              >
                <Icon name="headset" className="h-4 w-4" />
                Gọi {previewRow.booking.contact_phone}
              </a>
              <BookingQueueActions
                bookingId={previewRow.booking.id}
                phone={previewRow.booking.contact_phone}
                canClaim={
                  currentProfile?.role === "sales" &&
                  !previewRow.booking.assigned_sales_id &&
                  !["completed", "cancelled"].includes(previewRow.booking.status)
                }
              />
              <Link
                href={ROUTES.salesBooking(previewRow.booking.id)}
                className="col-span-2 inline-flex items-center justify-center gap-2 rounded-full border border-brand-green/25 px-4 py-2.5 text-sm font-bold text-brand-green transition-colors hover:bg-brand-green-soft"
              >
                Mở hồ sơ đầy đủ
                <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {visibleRows.length === 0 ? (
        <section className="grid min-h-[360px] place-items-center rounded-[28px] border border-dashed border-brand-green/20 bg-white p-8 text-center shadow-card">
          <div>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-green-soft text-brand-green">
              <Icon name="search" className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-brand-ink">
              Không tìm thấy booking phù hợp
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-brand-muted">
              Hãy thử đổi trạng thái, khoảng ngày đi hoặc xóa bớt điều kiện lọc.
            </p>
            <Link
              href={ROUTES.salesBookings}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-green px-5 py-2.5 text-sm font-bold text-white"
            >
              Xóa bộ lọc
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="hidden overflow-hidden rounded-[26px] border border-black/5 bg-white shadow-card lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1160px] border-collapse text-left">
                <thead className="bg-[#f8faf7] text-[10px] font-bold uppercase tracking-[0.12em] text-brand-muted">
                  <tr>
                    <th className="px-5 py-3.5">Ưu tiên</th>
                    <th className="px-4 py-3.5">Booking / Khách</th>
                    <th className="px-4 py-3.5">Ngày đi</th>
                    <th className="px-4 py-3.5">Gói</th>
                    <th className="px-4 py-3.5">Tổng dự kiến</th>
                    <th className="px-4 py-3.5">Trạng thái</th>
                    <th className="px-4 py-3.5">Phụ trách</th>
                    <th className="px-4 py-3.5">Cập nhật</th>
                    <th className="px-5 py-3.5 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {visibleRows.map(({ booking, trip, pkg, hasRisk, priority }) => {
                    const assigned = booking.assigned_sales_id
                      ? salesById.get(booking.assigned_sales_id)
                      : null;
                    return (
                      <tr
                        key={booking.id}
                        className="transition-colors hover:bg-brand-cream/[0.35]"
                      >
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold",
                              PRIORITY_TONE[priority.level],
                            )}
                          >
                            {priority.label}
                          </span>
                          <p className="mt-1.5 max-w-36 line-clamp-2 text-[10px] leading-4 text-brand-muted">
                            {priority.reasons.slice(0, 2).join(" · ")}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={ROUTES.salesBooking(booking.id)}
                            className="block text-xs font-bold tracking-wide text-brand-green hover:underline"
                          >
                            {booking.code}
                          </Link>
                          <span className="mt-1 block max-w-44 truncate text-sm font-bold text-brand-ink">
                            {booking.contact_name}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-brand-muted">
                            {booking.contact_phone}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-xs font-bold text-brand-ink">
                            {formatDate(trip?.start_date)}
                          </p>
                          <p className="mt-1 text-[10px] text-brand-muted">
                            {trip ? `${trip.num_days}N${trip.num_nights}Đ · ${trip.num_people} khách` : "—"}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="max-w-48 truncate text-xs font-bold text-brand-ink">
                            {pkg?.name ?? "—"}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            {pkg && (
                              <span className="text-[10px] text-brand-muted">
                                {PACKAGE_TIER_LABELS[pkg.tier]}
                              </span>
                            )}
                            {hasRisk && (
                              <span className="rounded-full bg-status-limited/10 px-2 py-0.5 text-[9px] font-bold text-status-limited">
                                Cần kiểm tra
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-brand-green">
                            {formatVNDShort(booking.total_price)}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <Badge tone={bookingStatusTone[booking.status]}>
                            {BOOKING_STATUS_LABELS[booking.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          {assigned ? (
                            <div className="flex items-center gap-2">
                              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-green-soft text-[10px] font-bold text-brand-green">
                                {(assigned.full_name ?? assigned.email).charAt(0).toUpperCase()}
                              </span>
                              <span className="max-w-28 truncate text-[11px] font-semibold text-brand-ink">
                                {assigned.full_name ?? assigned.email}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] font-semibold text-status-limited">
                              Chưa phân công
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-[10px] text-brand-muted">
                          {formatDateTime(booking.updated_at ?? booking.created_at)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <BookingQueueActions
                              bookingId={booking.id}
                              phone={booking.contact_phone}
                              canClaim={
                                currentProfile?.role === "sales" &&
                                !booking.assigned_sales_id &&
                                !["completed", "cancelled"].includes(booking.status)
                              }
                            />
                            <Link
                              href={hrefWith(searchParams, {
                                preview: booking.id,
                              }) + "#queue-preview"}
                              title="Xem nhanh"
                              aria-label={`Xem nhanh ${booking.code}`}
                              className="grid h-8 w-8 place-items-center rounded-full bg-brand-green-soft text-brand-green hover:bg-brand-green hover:text-white"
                            >
                              <Icon name="chevron-right" className="h-3.5 w-3.5" />
                            </Link>
                            <Link
                              href={ROUTES.salesBooking(booking.id)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-brand-green px-3 text-[11px] font-bold text-white hover:bg-brand-green-dark"
                            >
                              Chi tiết
                              <Icon name="arrow-right" className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 lg:hidden">
            {visibleRows.map(({ booking, trip, pkg, hasRisk, priority }) => {
              const assigned = booking.assigned_sales_id
                ? salesById.get(booking.assigned_sales_id)
                : null;
              return (
                <article
                  key={booking.id}
                  className="rounded-[24px] border border-black/5 bg-white p-5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold tracking-wide text-brand-green">
                        {booking.code}
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-brand-ink">
                        {booking.contact_name}
                      </h2>
                      <p className="mt-0.5 text-xs text-brand-muted">
                        {booking.contact_phone}
                      </p>
                    </div>
                    <Badge tone={bookingStatusTone[booking.status]}>
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[10px] font-bold",
                        PRIORITY_TONE[priority.level],
                      )}
                    >
                      {priority.label}
                    </span>
                    {hasRisk && (
                      <span className="rounded-full bg-status-limited/10 px-2.5 py-1 text-[10px] font-bold text-status-limited">
                        Có dịch vụ cần kiểm tra
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-brand-cream/[0.65] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                        Ngày đi
                      </p>
                      <p className="mt-1 text-xs font-bold text-brand-ink">
                        {formatDate(trip?.start_date)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-brand-cream/[0.65] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                        Tổng dự kiến
                      </p>
                      <p className="mt-1 text-xs font-bold text-brand-green">
                        {formatVND(booking.total_price)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-black/5 pt-4">
                    <p className="line-clamp-1 text-xs font-bold text-brand-ink">
                      {pkg?.name ?? "Chưa tải được gói"}
                    </p>
                    <p className="mt-1 text-[10px] text-brand-muted">
                      Phụ trách: {assigned?.full_name ?? assigned?.email ?? "Chưa phân công"}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <BookingQueueActions
                      bookingId={booking.id}
                      phone={booking.contact_phone}
                      canClaim={
                        currentProfile?.role === "sales" &&
                        !booking.assigned_sales_id &&
                        !["completed", "cancelled"].includes(booking.status)
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Link
                        href={
                          hrefWith(searchParams, { preview: booking.id }) +
                          "#queue-preview"
                        }
                        className="grid h-9 w-9 place-items-center rounded-full bg-brand-green-soft text-brand-green"
                        title="Xem nhanh"
                        aria-label={`Xem nhanh ${booking.code}`}
                      >
                        <Icon name="chevron-right" className="h-4 w-4" />
                      </Link>
                      <Link
                        href={ROUTES.salesBooking(booking.id)}
                        className="inline-flex items-center gap-2 rounded-full bg-brand-green px-4 py-2 text-xs font-bold text-white"
                      >
                        Chi tiết
                        <Icon name="arrow-right" className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          {totalPages > 1 && (
            <nav className="flex items-center justify-between rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-card">
              <Link
                href={hrefWith(searchParams, {
                  page: page > 1 ? String(page - 1) : undefined,
                  preview: undefined,
                })}
                aria-disabled={page === 1}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold",
                  page === 1
                    ? "pointer-events-none border-black/5 text-brand-muted/35"
                    : "border-brand-green/20 text-brand-green hover:bg-brand-green-soft",
                )}
              >
                ← Trang trước
              </Link>
              <span className="text-xs font-semibold text-brand-muted">
                Trang {page} / {totalPages}
              </span>
              <Link
                href={hrefWith(searchParams, {
                  page: page < totalPages ? String(page + 1) : undefined,
                  preview: undefined,
                })}
                aria-disabled={page === totalPages}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold",
                  page === totalPages
                    ? "pointer-events-none border-black/5 text-brand-muted/35"
                    : "border-brand-green/20 text-brand-green hover:bg-brand-green-soft",
                )}
              >
                Trang sau →
              </Link>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
