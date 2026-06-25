import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingQueueActions } from "@/components/sales/BookingQueueActions";
import { SalesBookingActions } from "@/components/sales/SalesBookingActions";
import { AvailabilityChecklist } from "@/components/sales/AvailabilityChecklist";
import { ContactFollowUp } from "@/components/sales/ContactFollowUp";
import { ReplaceServiceControl } from "@/components/sales/ReplaceServiceControl";
import { SalesItineraryTimeline } from "@/components/sales/SalesItineraryTimeline";
import { CostBreakdown } from "@/components/guest/CostBreakdown";
import { Badge, availabilityTone, bookingStatusTone } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { calculateSalesPriority } from "@/lib/sales/priority";
import { createClient } from "@/lib/supabase/server";
import {
  isSystemItinerarySlot,
  normalizeItineraryDays,
} from "@/lib/itinerary/structure";
import { cn, formatVND } from "@/lib/utils";
import {
  AVAILABILITY_CHECK_CATEGORIES,
  AVAILABILITY_LABELS,
  BOOKING_STATUS_LABELS,
  INTEREST_OPTIONS,
  PACKAGE_TIER_LABELS,
  PAYMENT_STATUS_LABELS,
  PRICE_UNIT_LABELS,
  PRODUCT_TYPE_LABELS,
  ROUTES,
  TRAVEL_STYLE_LABELS,
} from "@/lib/constants";
import type {
  AvailabilityCheckCategory,
  AvailabilityCheckStatus,
  AvailabilityStatus,
  BookingAvailabilityCheck,
  BookingFollowUp,
  BookingRequest,
  BookingStatusLog,
  Destination,
  PaymentStatus,
  ProductLocation,
  ProductType,
  Profile,
  SalesNoteType,
  TourPackage,
  TravelProduct,
  TravelStyle,
  TripRequest,
} from "@/types";

export const metadata: Metadata = {
  title: "Booking Detail — NiBiGo AI Travel Platform",
};
export const dynamic = "force-dynamic";

type PackageItem = {
  id: string;
  tour_package_id: string;
  product_id: string;
  day_number: number | null;
  slot: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  sort_order: number;
  created_at: string;
};

type SalesNote = {
  id: string;
  booking_request_id: string;
  author_id: string;
  content: string;
  note_type: SalesNoteType;
  created_at: string;
};

const PRIORITY_TONE = {
  urgent: "border-status-soldout/20 bg-status-soldout/10 text-status-soldout",
  high: "border-brand-gold/25 bg-brand-gold-soft text-[#9f6818]",
  normal: "border-black/5 bg-black/[0.035] text-brand-muted",
} as const;

const PRODUCT_ICON: Record<ProductType, IconName> = {
  hotel: "building",
  homestay: "home",
  activity: "ticket",
  restaurant: "utensils",
  transport: "car",
  combo: "sparkles",
};

const SLOT_LABEL: Record<string, string> = {
  morning: "Buổi sáng",
  noon: "Buổi trưa",
  afternoon: "Buổi chiều",
  evening: "Buổi tối",
};

const SALES_NOTE_LABELS: Record<SalesNoteType, string> = {
  contact_attempt: "Lần liên hệ",
  customer_preference: "Nhu cầu sau trao đổi",
  price_discussion: "Trao đổi về chi phí",
  partner_confirmation: "Xác nhận với đối tác",
  risk_warning: "Rủi ro cần lưu ý",
  follow_up: "Việc cần theo dõi",
  general: "Ghi chú chung",
};

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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

function parseGuestNote(value: string | null) {
  const parsed = {
    preferredChannel: "",
    specialRequest: "",
    extraNote: "",
    other: [] as string[],
  };

  for (const rawLine of value?.split(/\r?\n/) ?? []) {
    const line = rawLine.trim();
    if (!line) continue;
    const normalized = line.toLocaleLowerCase("vi-VN");

    if (normalized.startsWith("kênh liên hệ ưu tiên:")) {
      parsed.preferredChannel = line.split(":").slice(1).join(":").trim();
    } else if (normalized.startsWith("yêu cầu đặc biệt:")) {
      parsed.specialRequest = line.split(":").slice(1).join(":").trim();
    } else if (normalized.startsWith("ghi chú thêm:")) {
      parsed.extraNote = line.split(":").slice(1).join(":").trim();
    } else {
      parsed.other.push(line);
    }
  }

  return parsed;
}

function groupSummary(trip: TripRequest | null) {
  if (!trip) return "Chưa có dữ liệu";
  const group = trip.group_composition;
  const parts = [
    group?.adults ? `${group.adults} người lớn` : "",
    group?.children ? `${group.children} trẻ em` : "",
    group?.elderly ? `${group.elderly} người lớn tuổi` : "",
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : `${trip.num_people} người`;
}

function SectionHeading({
  eyebrow,
  title,
  icon,
  description,
}: {
  eyebrow: string;
  title: string;
  icon: IconName;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-bold text-brand-ink">{title}</h2>
        {description && (
          <p className="mt-1 max-w-2xl text-xs leading-5 text-brand-muted">
            {description}
          </p>
        )}
      </div>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-green-soft text-brand-green">
        <Icon name={icon} className="h-5 w-5" />
      </span>
    </div>
  );
}

export default async function SalesBookingDetailPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const supabase = createClient();
  const { data: bookingData } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("id", params.bookingId)
    .single();

  if (!bookingData) notFound();
  const booking = bookingData as BookingRequest;

  const [
    { data: authData },
    { data: tripData },
    { data: packageData },
    { data: itemData },
    { data: logData },
    { data: noteData },
    { data: availabilityData },
    { data: followupData },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("trip_requests").select("*").eq("id", booking.trip_request_id).single(),
    supabase.from("tour_packages").select("*").eq("id", booking.tour_package_id).single(),
    supabase
      .from("tour_package_items")
      .select("*")
      .eq("tour_package_id", booking.tour_package_id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("booking_status_logs")
      .select("*")
      .eq("booking_request_id", booking.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("sales_notes")
      .select("id, booking_request_id, author_id, content, note_type, created_at")
      .eq("booking_request_id", booking.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("booking_availability_checks")
      .select("*")
      .eq("booking_request_id", booking.id),
    supabase
      .from("booking_followups")
      .select("*")
      .eq("booking_request_id", booking.id)
      .order("created_at", { ascending: false }),
  ]);

  const trip = tripData as TripRequest | null;
  const pkg = packageData as TourPackage | null;
  const itinerary = normalizeItineraryDays(pkg?.itinerary ?? [], trip?.num_days);
  const items = (itemData as PackageItem[] | null) ?? [];
  const logs = (logData as BookingStatusLog[] | null) ?? [];
  const notes = (noteData as SalesNote[] | null) ?? [];

  const followups = (followupData as BookingFollowUp[] | null) ?? [];
  const availabilityChecks = (availabilityData as BookingAvailabilityCheck[] | null) ?? [];
  const checkByCategory = new Map(
    availabilityChecks.map((check) => [check.category, check]),
  );
  const initialChecks = Object.fromEntries(
    AVAILABILITY_CHECK_CATEGORIES.map((category) => {
      const found = checkByCategory.get(category);
      return [
        category,
        { status: found?.status ?? "pending", note: found?.note ?? "" },
      ];
    }),
  ) as Record<
    AvailabilityCheckCategory,
    { status: AvailabilityCheckStatus; note: string }
  >;

  const productIds = Array.from(
    new Set([
      ...items.map((item) => item.product_id),
      ...itinerary.flatMap((day) =>
        day.slots
          .filter((slot) => !isSystemItinerarySlot(slot))
          .map((slot) => slot.product_id),
      ),
    ]),
  );
  const profileIds = Array.from(
    new Set(
      [
        booking.user_id,
        booking.assigned_sales_id,
        authData.user?.id,
        ...notes.map((note) => note.author_id),
        ...logs.map((log) => log.changed_by),
      ].filter((id): id is string => Boolean(id)),
    ),
  );

  const [
    { data: productData },
    { data: locationData },
    { data: profileData },
    { data: destinationData },
  ] = await Promise.all([
    productIds.length
      ? supabase.from("products").select("*").in("id", productIds)
      : Promise.resolve({ data: [] }),
    productIds.length
      ? supabase.from("product_locations").select("*").in("product_id", productIds)
      : Promise.resolve({ data: [] }),
    profileIds.length
      ? supabase
          .from("profiles")
          .select("id, email, full_name, phone, role, avatar_url, created_at")
          .in("id", profileIds)
      : Promise.resolve({ data: [] }),
    trip?.destination_id
      ? supabase.from("destinations").select("*").eq("id", trip.destination_id).single()
      : Promise.resolve({ data: null }),
  ]);

  const products = (productData as TravelProduct[] | null) ?? [];
  const locations = (locationData as ProductLocation[] | null) ?? [];
  const profiles = (profileData as Profile[] | null) ?? [];
  const destination = destinationData as Destination | null;
  const productById = new Map(products.map((product) => [product.id, product]));
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const currentProfile = authData.user ? profileById.get(authData.user.id) : null;
  const buyerProfile = profileById.get(booking.user_id);
  const assignedProfile = booking.assigned_sales_id
    ? profileById.get(booking.assigned_sales_id)
    : null;
  const guestNote = parseGuestNote(booking.note_from_guest);
  const paymentStatus = booking.payment_status ?? "unpaid";
  const canMutateBooking =
    currentProfile?.role === "admin" ||
    (Boolean(authData.user?.id) && booking.assigned_sales_id === authData.user?.id);
  const canReplaceService =
    canMutateBooking && booking.status === "checking_availability";

  const selectedProducts = Array.from(
    new Map(
      items
        .map((item) => productById.get(item.product_id))
        .filter((product): product is TravelProduct => Boolean(product))
        .map((product) => [product.id, product]),
    ).values(),
  );
  const availabilityCounts: Record<AvailabilityStatus, number> = {
    available: 0,
    limited: 0,
    sold_out: 0,
    need_confirmation: 0,
  };
  selectedProducts.forEach((product) => {
    availabilityCounts[product.availability_status] += 1;
  });
  const riskCount =
    availabilityCounts.limited +
    availabilityCounts.sold_out +
    availabilityCounts.need_confirmation;
  const hasAvailabilityRisk = riskCount > 0;
  const priority = calculateSalesPriority({
    booking,
    trip: trip ?? undefined,
    pkg: pkg ?? undefined,
    hasAvailabilityRisk,
  });

  const interestLabel = new Map(
    INTEREST_OPTIONS.map((interest) => [interest.value, interest.label]),
  );
  const budgetDifference = pkg && trip ? pkg.total_price - trip.budget : null;
  const bookingPackageDifference = pkg
    ? booking.total_price - pkg.total_price
    : null;
  const displayedLogs =
    logs.length > 0
      ? logs
      : [
          {
            id: `${booking.id}-created`,
            booking_request_id: booking.id,
            from_status: null,
            to_status: booking.status,
            changed_by: null,
            note: "Booking được tạo từ yêu cầu của khách.",
            created_at: booking.created_at,
          } satisfies BookingStatusLog,
        ];

  return (
    <div className="space-y-6">
      <Link
        href={ROUTES.salesBookings}
        className="inline-flex items-center gap-2 text-xs font-bold text-brand-muted transition-colors hover:text-brand-green"
      >
        <span className="rotate-180">
          <Icon name="arrow-right" className="h-4 w-4" />
        </span>
        Quay lại Booking Queue
      </Link>

      <section className="overflow-hidden rounded-[28px] border border-black/[0.055] bg-white shadow-card">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#286f54] via-brand-green to-brand-green-dark p-6 text-white sm:p-8">
            <span className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full border-[52px] border-white/[0.05]" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.17em] text-brand-gold">
                  Sales Booking Detail
                </span>
                <Badge
                  tone={bookingStatusTone[booking.status]}
                  className="px-3 py-1 text-[11px] font-bold"
                >
                  {BOOKING_STATUS_LABELS[booking.status]}
                </Badge>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold text-white/80">
                  Thao tác có kiểm soát
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
                {booking.code} · {booking.contact_name}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/[0.72]">
                {pkg?.name ?? "Chưa tải được tên gói"} ·{" "}
                {destination?.name ?? "Chưa xác định điểm đến"}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {priority.reasons.map((reason) => (
                  <span
                    key={reason}
                    className="rounded-full border border-white/10 bg-white/[0.09] px-3 py-1.5 text-[11px] font-semibold text-white/85"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 bg-[#fffdf9] p-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-muted">
                Mức ưu tiên hiện tại
              </p>
              <span
                className={cn(
                  "mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-bold",
                  PRIORITY_TONE[priority.level],
                )}
              >
                {priority.label} · {priority.score} điểm
              </span>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-brand-muted">Phụ trách</dt>
                  <dd className="text-right font-bold text-brand-ink">
                    {assignedProfile?.full_name ??
                      assignedProfile?.email ??
                      "Chưa phân công"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-brand-muted">Ngày gửi</dt>
                  <dd className="text-right font-bold text-brand-ink">
                    {formatDateTime(booking.created_at)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-brand-muted">Ngày khởi hành</dt>
                  <dd className="text-right font-bold text-brand-ink">
                    {formatDate(trip?.start_date)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-black/5 pt-4">
              <a
                href={`tel:${booking.contact_phone}`}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-brand-green px-4 text-xs font-bold text-white"
              >
                <Icon name="headset" className="h-4 w-4" />
                Gọi khách
              </a>
              {booking.contact_email && (
                <a
                  href={`mailto:${booking.contact_email}`}
                  className="grid h-10 w-10 place-items-center rounded-full border border-brand-green/25 text-brand-green transition hover:bg-brand-green-soft"
                  title="Gửi email"
                >
                  <Icon name="arrow-right" className="h-4 w-4 -rotate-45" />
                </a>
              )}
              <BookingQueueActions
                bookingId={booking.id}
                phone={booking.contact_phone}
                canClaim={
                  currentProfile?.role === "sales" &&
                  !booking.assigned_sales_id &&
                  !["completed", "cancelled"].includes(booking.status)
                }
              />
            </div>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
        <main className="space-y-6">
          <section className="rounded-[26px] border border-black/5 bg-white p-5 shadow-card sm:p-6">
            <SectionHeading
              eyebrow="01 · Hiểu người liên hệ"
              title="Khách hàng và cách trao đổi"
              icon="user"
              description="Thông tin Sales cần nắm trước khi chủ động liên hệ."
            />

            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="min-h-24 rounded-2xl bg-brand-cream/[0.62] p-4">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Người liên hệ
                </dt>
                <dd className="mt-1 text-base font-bold text-brand-ink">
                  {booking.contact_name}
                </dd>
                {buyerProfile?.full_name &&
                  buyerProfile.full_name !== booking.contact_name && (
                    <p className="mt-1 text-xs text-brand-muted">
                      Tài khoản: {buyerProfile.full_name}
                    </p>
                  )}
              </div>
              <div className="min-h-24 rounded-2xl bg-brand-cream/[0.62] p-4">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Kênh ưu tiên
                </dt>
                <dd className="mt-1 text-base font-bold text-brand-ink">
                  {guestNote.preferredChannel || "Chưa chỉ định"}
                </dd>
                <p className="mt-1 text-xs text-brand-muted">{booking.contact_phone}</p>
              </div>
              <div className="min-h-24 rounded-2xl bg-brand-cream/[0.62] p-4">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Email
                </dt>
                <dd className="mt-1 break-all text-sm font-bold text-brand-ink">
                  {booking.contact_email || buyerProfile?.email || "Chưa cung cấp"}
                </dd>
              </div>
              <div className="min-h-24 rounded-2xl bg-brand-cream/[0.62] p-4">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Nhóm khách
                </dt>
                <dd className="mt-1 text-sm font-bold leading-6 text-brand-ink">
                  {groupSummary(trip)}
                </dd>
              </div>
            </dl>

            {(guestNote.extraNote || guestNote.other.length > 0) && (
              <div className="mt-4 rounded-2xl border border-black/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Ghi chú khách để lại
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-brand-ink">
                  {[guestNote.extraNote, ...guestNote.other].filter(Boolean).join("\n")}
                </p>
              </div>
            )}
          </section>

          <section className="rounded-[26px] border border-black/5 bg-white p-5 shadow-card sm:p-6">
            <SectionHeading
              eyebrow="02 · Hiểu chuyến đi"
              title="Nhu cầu và giới hạn cần tôn trọng"
              icon="route"
              description="Các dữ liệu gốc từ form lập kế hoạch của khách."
            />

            <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="min-h-24 rounded-2xl bg-brand-cream/[0.62] p-4">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Điểm đến
                </dt>
                <dd className="mt-2 text-sm font-bold text-brand-ink">
                  {destination?.name ?? "Chưa xác định"}
                </dd>
              </div>
              <div className="min-h-24 rounded-2xl bg-brand-cream/[0.62] p-4">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Thời gian
                </dt>
                <dd className="mt-2 text-sm font-bold text-brand-ink">
                  {trip ? `${trip.num_days}N${trip.num_nights}Đ` : "—"}
                </dd>
                <p className="mt-1 text-xs text-brand-muted">
                  {formatDate(trip?.start_date)}
                </p>
              </div>
              <div className="min-h-24 rounded-2xl bg-brand-cream/[0.62] p-4">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Ngân sách đoàn
                </dt>
                <dd className="mt-2 text-sm font-bold text-brand-green">
                  {trip ? formatVND(trip.budget) : "—"}
                </dd>
              </div>
              <div className="min-h-24 rounded-2xl bg-brand-cream/[0.62] p-4">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Phong cách
                </dt>
                <dd className="mt-2 text-sm font-bold leading-5 text-brand-ink">
                  {trip?.travel_style
                    ? (TRAVEL_STYLE_LABELS[trip.travel_style as TravelStyle] ??
                      trip.travel_style)
                    : "Chưa chọn"}
                </dd>
              </div>
            </dl>

            {trip && trip.interests.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Sở thích
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {trip.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full bg-brand-green-soft px-3 py-1.5 text-[11px] font-bold text-brand-green"
                    >
                      {interestLabel.get(interest) ?? interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(trip?.special_requests || guestNote.specialRequest) && (
              <div className="mt-4 rounded-2xl border border-brand-gold/20 bg-brand-gold-soft/[0.42] p-4">
                <div className="flex gap-3">
                  <Icon
                    name="shield"
                    className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold"
                  />
                  <div>
                    <p className="text-xs font-bold text-brand-ink">Yêu cầu cần ưu tiên</p>
                    <p className="mt-1 text-sm leading-6 text-brand-muted">
                      {guestNote.specialRequest || trip?.special_requests}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-[26px] border border-brand-green/15 bg-brand-green-soft/[0.34] p-5 shadow-card sm:p-6">
            <SectionHeading
              eyebrow="03 · Gợi ý hỗ trợ tư vấn"
              title="Điểm cần lưu ý trước khi liên hệ"
              icon="sparkles"
              description="Dùng như bản tóm tắt nhanh; Sales vẫn đối chiếu lại với dữ liệu chuyến đi và dịch vụ."
            />
            <div className="mt-5 rounded-[20px] bg-white p-5">
              {booking.ai_sales_note ? (
                <p className="whitespace-pre-line text-sm leading-7 text-brand-ink">
                  {booking.ai_sales_note}
                </p>
              ) : (
                <p className="text-sm leading-6 text-brand-muted">
                  Chưa có ghi chú hỗ trợ tư vấn cho booking này. Hãy dựa trên nhu cầu,
                  ngân sách và cảnh báo dịch vụ bên dưới khi trao đổi với khách.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[26px] border border-black/5 bg-white p-5 shadow-card sm:p-6">
            <SectionHeading
              eyebrow="04 · Gói khách đã chọn"
              title={pkg?.name ?? "Chưa tải được thông tin gói"}
              icon="ticket"
              description="Đây là phương án khách gửi yêu cầu, chưa đồng nghĩa mọi dịch vụ đã được giữ chỗ."
            />

            {pkg && (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="min-h-24 rounded-2xl bg-brand-cream/[0.62] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                      Phân hạng
                    </p>
                    <p className="mt-2 text-sm font-bold text-brand-ink">
                      {PACKAGE_TIER_LABELS[pkg.tier]}
                    </p>
                  </div>
                  <div className="min-h-24 rounded-2xl bg-brand-cream/[0.62] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                      Độ phù hợp
                    </p>
                    <p className="mt-2 text-sm font-bold text-brand-green">
                      {pkg.fit_score}/100
                    </p>
                  </div>
                  <div className="min-h-24 rounded-2xl bg-brand-cream/[0.62] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                      Lần điều chỉnh
                    </p>
                    <p className="mt-2 text-sm font-bold text-brand-ink">
                      {pkg.revision_count} lần
                    </p>
                  </div>
                </div>

                {pkg.recommendation_reason && (
                  <div className="mt-4 rounded-2xl border border-black/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                      Vì sao phương án này được đề xuất
                    </p>
                    <p className="mt-2 text-sm leading-6 text-brand-ink">
                      {pkg.recommendation_reason}
                    </p>
                  </div>
                )}

                {budgetDifference !== null && (
                  <div
                    className={cn(
                      "mt-4 rounded-2xl p-4 text-sm",
                      budgetDifference <= 0
                        ? "bg-brand-green-soft/[0.65] text-brand-green"
                        : "bg-status-limited/10 text-[#9f6818]",
                    )}
                  >
                    <strong>
                      {budgetDifference <= 0
                        ? `Gói đang thấp hơn ngân sách ${formatVND(
                            Math.abs(budgetDifference),
                          )}.`
                        : `Gói đang cao hơn ngân sách ${formatVND(
                            budgetDifference,
                          )}.`}
                    </strong>{" "}
                    Đây là điểm nên nói rõ khi tư vấn.
                  </div>
                )}
              </>
            )}
          </section>

          <section className="rounded-[26px] border border-black/5 bg-white p-5 shadow-card sm:p-6">
            <SectionHeading
              eyebrow="05 · Dịch vụ trong gói"
              title={`Danh sách cần kiểm tra (${items.length})`}
              icon="list"
              description="Giá và tình trạng dưới đây là dữ liệu đang lưu, chưa thay thế xác nhận trực tiếp với nhà cung cấp."
            />

            {items.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-black/10 bg-brand-cream/[0.45] p-5 text-sm text-brand-muted">
                Gói hiện tại chưa có dòng dịch vụ chi tiết.
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {items.map((item) => {
                  const product = productById.get(item.product_id);
                  return (
                    <article
                      key={item.id}
                      className="flex min-h-56 flex-col rounded-[20px] border border-black/[0.06] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-green-soft text-brand-green">
                          <Icon
                            name={product ? PRODUCT_ICON[product.type] : "ticket"}
                            className="h-5 w-5"
                          />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                            {product
                              ? PRODUCT_TYPE_LABELS[product.type]
                              : "Dịch vụ chưa tải được"}
                          </p>
                          <h3 className="mt-1 text-base font-bold leading-snug text-brand-ink">
                            {product?.name ?? item.product_id}
                          </h3>
                        </div>
                        {product && (
                          <Badge tone={availabilityTone[product.availability_status]}>
                            {AVAILABILITY_LABELS[product.availability_status]}
                          </Badge>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-brand-muted">
                        {item.day_number && (
                          <span className="rounded-full bg-brand-cream px-2.5 py-1">
                            Ngày {item.day_number}
                          </span>
                        )}
                        {item.slot && (
                          <span className="rounded-full bg-brand-cream px-2.5 py-1">
                            {SLOT_LABEL[item.slot] ?? item.slot}
                          </span>
                        )}
                        <span className="rounded-full bg-brand-cream px-2.5 py-1">
                          Số lượng: {item.quantity}
                        </span>
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-3 border-t border-black/5 pt-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                            Đơn giá
                          </p>
                          <p className="mt-1 text-xs font-bold text-brand-ink">
                            {formatVND(item.unit_price)}
                            {product ? ` ${PRICE_UNIT_LABELS[product.price_unit]}` : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                            Thành tiền
                          </p>
                          <p className="mt-1 text-sm font-bold text-brand-green">
                            {formatVND(item.line_total)}
                          </p>
                        </div>
                      </div>

                      {canReplaceService && (
                        <ReplaceServiceControl bookingId={booking.id} itemId={item.id} />
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <AvailabilityChecklist
            bookingId={booking.id}
            status={booking.status}
            canMutate={canMutateBooking}
            estimatedTotal={booking.total_price}
            initialChecks={initialChecks}
            finalPrice={booking.final_price ?? null}
            finalPriceNote={booking.final_price_note ?? null}
            customerAgreed={Boolean(booking.customer_agreed)}
            hasInternalNote={notes.length > 0}
          />

          <section className="rounded-[26px] border border-black/5 bg-white p-5 shadow-card sm:p-6">
            <SectionHeading
              eyebrow="07 · Lịch trình đọc nhanh"
              title="Dịch vụ nằm ở đâu trong chuyến đi"
              icon="calendar"
              description="Bản lịch trình chỉ để đối chiếu khi tư vấn; thay đổi gói sẽ được xử lý ở luồng riêng."
            />
            <div className="mt-5">
              <SalesItineraryTimeline
                itinerary={itinerary}
                products={products}
                locations={locations}
              />
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[26px] border border-black/5 bg-white p-5 shadow-card sm:p-6">
              <SectionHeading
                eyebrow="08 · Ghi chú nội bộ"
                title="Thông tin từ đội Sales"
                icon="list"
              />
              {notes.length === 0 ? (
                <p className="mt-5 rounded-2xl bg-brand-cream/[0.55] p-4 text-sm leading-6 text-brand-muted">
                  Chưa có ghi chú nội bộ cho booking này.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {notes.map((note) => {
                    const author = profileById.get(note.author_id);
                    return (
                      <article
                        key={note.id}
                        className="rounded-2xl border border-black/5 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-brand-ink">
                              {author?.full_name ?? author?.email ?? "Nhân viên Sales"}
                            </p>
                            <span className="mt-1 inline-flex rounded-full bg-brand-green-soft px-2 py-0.5 text-[9px] font-bold text-brand-green">
                              {SALES_NOTE_LABELS[note.note_type] ?? "Ghi chú chung"}
                            </span>
                          </div>
                          <time className="text-[10px] text-brand-muted">
                            {formatDateTime(note.created_at)}
                          </time>
                        </div>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-brand-muted">
                          {note.content}
                        </p>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-[26px] border border-black/5 bg-white p-5 shadow-card sm:p-6">
              <SectionHeading
                eyebrow="09 · Lịch sử xử lý"
                title="Các mốc đã ghi nhận"
                icon="clock"
              />
              <ol className="mt-5">
                {displayedLogs.map((log, index) => {
                  const actor = log.changed_by
                    ? profileById.get(log.changed_by)
                    : null;
                  return (
                    <li key={log.id} className="relative flex gap-3 pb-5 last:pb-0">
                      {index < displayedLogs.length - 1 && (
                        <span className="absolute left-[17px] top-9 h-[calc(100%-18px)] w-px bg-brand-green-soft" />
                      )}
                      <span
                        className={cn(
                          "relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full",
                          log.to_status === "cancelled"
                            ? "bg-status-soldout/10 text-status-soldout"
                            : "bg-brand-green-soft text-brand-green",
                        )}
                      >
                        <Icon
                          name={log.to_status === "cancelled" ? "x" : "check"}
                          className="h-4 w-4"
                        />
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-sm font-bold text-brand-ink">
                          {BOOKING_STATUS_LABELS[log.to_status]}
                        </p>
                        <p className="mt-0.5 text-[10px] text-brand-muted">
                          {formatDateTime(log.created_at)}
                          {actor ? ` · ${actor.full_name ?? actor.email}` : ""}
                        </p>
                        {log.note && (
                          <p className="mt-1 text-xs leading-5 text-brand-muted">
                            {log.note}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        </main>

        <aside className="space-y-5">
          <SalesBookingActions
            bookingId={booking.id}
            status={booking.status}
            role={currentProfile?.role === "admin" ? "admin" : "sales"}
            assignedToCurrentUser={
              Boolean(authData.user?.id) &&
              booking.assigned_sales_id === authData.user?.id
            }
            hasAssignee={Boolean(booking.assigned_sales_id)}
          />

          <ContactFollowUp
            bookingId={booking.id}
            canMutate={canMutateBooking}
            phone={booking.contact_phone}
            email={booking.contact_email}
            preferredChannel={guestNote.preferredChannel || null}
            contactStatus={booking.contact_status ?? "not_contacted"}
            lastContactedAt={booking.last_contacted_at ?? null}
            followups={followups}
          />

          <section className="rounded-[24px] border border-black/5 bg-white p-5 shadow-card">
            <SectionHeading
              eyebrow="Đối chiếu chi phí"
              title="Tổng dự kiến"
              icon="wallet"
            />
            <div className="mt-5">
              {pkg ? (
                <CostBreakdown
                  data={pkg.cost_breakdown}
                  people={trip?.num_people ?? 1}
                />
              ) : (
                <p className="rounded-2xl bg-brand-cream/[0.55] p-4 text-sm text-brand-muted">
                  Chưa tải được cơ cấu chi phí.
                </p>
              )}
            </div>

            <div className="mt-4 border-t border-black/5 pt-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-brand-muted">
                  Tổng tại thời điểm gửi
                </span>
                <strong className="text-base text-brand-green">
                  {formatVND(booking.total_price)}
                </strong>
              </div>
              {bookingPackageDifference !== null && bookingPackageDifference !== 0 && (
                <p className="mt-3 rounded-xl bg-status-limited/10 p-3 text-xs leading-5 text-[#9f6818]">
                  Tổng booking lệch {formatVND(Math.abs(bookingPackageDifference))} so
                  với gói hiện tại. Cần đối chiếu trước khi báo giá.
                </p>
              )}
            </div>
          </section>

          <section
            className={cn(
              "rounded-[24px] border p-5",
              availabilityCounts.sold_out > 0
                ? "border-status-soldout/20 bg-status-soldout/[0.055]"
                : riskCount > 0
                  ? "border-brand-gold/20 bg-brand-gold-soft/[0.35]"
                  : "border-brand-green/15 bg-brand-green-soft/[0.38]",
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-2xl",
                  availabilityCounts.sold_out > 0
                    ? "bg-status-soldout/10 text-status-soldout"
                    : "bg-white text-brand-green",
                )}
              >
                <Icon name="shield" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-muted">
                  Trạng thái dịch vụ
                </p>
                <h2 className="mt-1 text-lg font-bold text-brand-ink">
                  {availabilityCounts.sold_out > 0
                    ? "Có dịch vụ đang hết chỗ"
                    : riskCount > 0
                      ? "Cần kiểm tra trước khi tư vấn"
                      : "Chưa thấy cảnh báo hiện tại"}
                </h2>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-2">
              {(
                Object.entries(availabilityCounts) as [
                  AvailabilityStatus,
                  number,
                ][]
              ).map(([status, count]) => (
                <div key={status} className="rounded-2xl bg-white/80 p-3">
                  <dt className="text-[10px] font-semibold text-brand-muted">
                    {AVAILABILITY_LABELS[status]}
                  </dt>
                  <dd className="mt-1 text-lg font-bold text-brand-ink">{count}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 text-xs leading-5 text-brand-muted">
              Đây là trạng thái dữ liệu đang lưu, không phải cam kết giữ chỗ. Sales
              cần xác nhận lại từng dịch vụ trước khi chuyển khách sang bước thanh toán.
            </p>
          </section>

          <section className="rounded-[24px] border border-black/5 bg-white p-5 shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold">
              Thanh toán và điều kiện
            </p>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-brand-cream/[0.62] p-4">
              <span className="text-xs font-semibold text-brand-muted">Thanh toán</span>
              <Badge tone={paymentStatus === "paid_demo" ? "green" : "neutral"}>
                {PAYMENT_STATUS_LABELS[paymentStatus as PaymentStatus]}
              </Badge>
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                Điều kiện của gói
              </p>
              {pkg && pkg.conditions.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {pkg.conditions.map((condition, index) => (
                    <li
                      key={`${index}-${condition}`}
                      className="flex gap-2 text-xs leading-5 text-brand-muted"
                    >
                      <Icon
                        name="check"
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-green"
                      />
                      {condition}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs leading-5 text-brand-muted">
                  Chưa có điều kiện riêng được lưu cho gói này.
                </p>
              )}
            </div>
          </section>

        </aside>
      </div>
    </div>
  );
}
