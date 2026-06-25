import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge, availabilityTone, bookingStatusTone } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { QuickTripForm } from "@/components/guest/QuickTripForm";
import { formatVND } from "@/lib/utils";
import {
  ROUTES,
  TRIP_STATUS_LABELS,
  BOOKING_STATUS_LABELS,
  ENGINE_NAME,
  AVAILABILITY_LABELS,
  PRICE_UNIT_LABELS,
  PRODUCT_TYPE_LABELS,
} from "@/lib/constants";
import type {
  BookingRequest,
  ProductType,
  TravelProduct,
  TripRequest,
  TripStatus,
} from "@/types";

export const metadata: Metadata = { title: "Tổng quan — NiBiGo AI Travel Platform" };
export const dynamic = "force-dynamic";

const tripStatusTone: Record<TripStatus, "neutral" | "green" | "gold" | "amber"> = {
  draft: "neutral",
  generated: "green",
  revised: "gold",
  submitted: "green",
};

const ACTIVE_BOOKING = ["new", "contacted", "checking_availability", "waiting_payment"];

type TripRow = Pick<
  TripRequest,
  | "id"
  | "num_days"
  | "num_nights"
  | "num_people"
  | "budget"
  | "travel_style"
  | "status"
  | "start_date"
  | "created_at"
>;

type BookingRow = Pick<BookingRequest, "id" | "code" | "status" | "total_price" | "created_at">;

type DashboardProduct = Pick<
  TravelProduct,
  | "id"
  | "name"
  | "type"
  | "description"
  | "price"
  | "price_unit"
  | "image_url"
  | "availability_status"
  | "tags"
>;

const categories: {
  title: string;
  description: string;
  icon: IconName;
  href: string;
  tone: string;
}[] = [
  {
    title: "Tour & trải nghiệm",
    description: "Tràng An, Tam Cốc, Hang Múa",
    icon: "ticket",
    href: `${ROUTES.explore}?category=activity`,
    tone: "bg-[#e9f2ed] text-brand-green",
  },
  {
    title: "Lưu trú",
    description: "Hotel, homestay và resort",
    icon: "building",
    href: `${ROUTES.explore}?category=hotel`,
    tone: "bg-[#f7ead6] text-[#a6651c]",
  },
  {
    title: "Di chuyển",
    description: "Xe ghép, limousine, xe riêng",
    icon: "car",
    href: `${ROUTES.explore}?category=transport`,
    tone: "bg-[#e8eef7] text-[#315f91]",
  },
  {
    title: "Ẩm thực",
    description: "Đặc sản dê núi và món địa phương",
    icon: "utensils",
    href: `${ROUTES.explore}?category=restaurant`,
    tone: "bg-[#f8e9e4] text-[#a84f38]",
  },
  {
    title: "Combo phù hợp",
    description: "Gợi ý trọn gói theo nhu cầu",
    icon: "sparkles",
    href: `${ROUTES.explore}?category=combo`,
    tone: "bg-[#eee8f7] text-[#71509a]",
  },
];

const productTone: Record<ProductType, string> = {
  hotel: "from-[#3d6b57] to-[#183f30]",
  homestay: "from-[#94734d] to-[#533d27]",
  activity: "from-[#3e765e] to-[#174a36]",
  restaurant: "from-[#a56042] to-[#66331f]",
  transport: "from-[#557088] to-[#293f54]",
  combo: "from-[#725b8d] to-[#3e3155]",
};

function ProductCard({ product }: { product: DashboardProduct }) {
  const background = product.image_url
    ? { backgroundImage: `linear-gradient(to top, rgba(13,35,26,.82), rgba(13,35,26,.06)), url("${product.image_url}")` }
    : undefined;

  return (
    <article className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-card">
      <div
        style={background}
        className={`relative h-36 bg-cover bg-center ${
          product.image_url ? "" : `bg-gradient-to-br ${productTone[product.type]}`
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute left-3 top-3">
          <Badge tone={availabilityTone[product.availability_status]}>
            {AVAILABILITY_LABELS[product.availability_status]}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
            {PRODUCT_TYPE_LABELS[product.type]}
          </p>
          <h3 className="mt-1 line-clamp-2 font-bold leading-snug">{product.name}</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-brand-muted">Giá tham khảo từ</p>
            <p className="font-extrabold text-brand-green">
              {formatVND(product.price)}
              <span className="ml-1 text-xs font-medium text-brand-muted">
                {PRICE_UNIT_LABELS[product.price_unit]}
              </span>
            </p>
          </div>
          <Link
            href={`${ROUTES.plan}?interest=${product.tags[0] ?? "nature"}`}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-green-soft text-brand-green transition group-hover:bg-brand-green group-hover:text-white"
            aria-label={`Lập kế hoạch với ${product.name}`}
          >
            <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function EmptySaved() {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-brand-cream/60 px-5 text-center">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-brand-green shadow-sm">
        <Icon name="heart" className="h-[18px] w-[18px]" />
      </span>
      <p className="mt-3 text-sm font-bold text-brand-ink">Chưa có dịch vụ đã lưu</p>
      <p className="mt-1 text-xs leading-relaxed text-brand-muted">
        Dịch vụ bạn yêu thích sẽ xuất hiện tại đây.
      </p>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    profileResult,
    tripsResult,
    bookingsResult,
    tripCountResult,
    bookingCountResult,
    activeBookingCountResult,
    savedCountResult,
    featuredResult,
    savedRowsResult,
  ] = await Promise.all([
    user
      ? supabase.from("profiles").select("full_name").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
    supabase
      .from("trip_requests")
      .select(
        "id, num_days, num_nights, num_people, budget, travel_style, status, start_date, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("booking_requests")
      .select("id, code, status, total_price, created_at")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase.from("trip_requests").select("*", { count: "exact", head: true }),
    supabase.from("booking_requests").select("*", { count: "exact", head: true }),
    supabase
      .from("booking_requests")
      .select("*", { count: "exact", head: true })
      .in("status", ACTIVE_BOOKING),
    user
      ? supabase
          .from("saved_products")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
      : Promise.resolve({ count: 0 }),
    supabase
      .from("products")
      .select(
        "id, name, type, description, price, price_unit, image_url, availability_status, tags",
      )
      .eq("is_active", true)
      .eq("status", "published")
      .neq("availability_status", "sold_out")
      .order("quality_score", { ascending: false })
      .limit(3),
    user
      ? supabase
          .from("saved_products")
          .select("product_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3)
      : Promise.resolve({ data: [] }),
  ]);

  const trips = (tripsResult.data as TripRow[] | null) ?? [];
  const bookings = (bookingsResult.data as BookingRow[] | null) ?? [];
  const featuredProducts = (featuredResult.data as DashboardProduct[] | null) ?? [];
  const savedIds =
    (savedRowsResult.data as { product_id: string }[] | null)?.map((row) => row.product_id) ?? [];

  const savedProducts =
    savedIds.length > 0
      ? ((
          await supabase
            .from("products")
            .select(
              "id, name, type, description, price, price_unit, image_url, availability_status, tags",
            )
            .in("id", savedIds)
        ).data as DashboardProduct[] | null) ?? []
      : [];

  const name = profileResult.data?.full_name?.trim().split(/\s+/).slice(-1)[0] ?? "bạn";
  const unfinishedPlan = trips.find((trip) => trip.status !== "submitted");
  const activeBooking = bookings.find((booking) => ACTIVE_BOOKING.includes(booking.status));

  const stats: {
    label: string;
    value: number;
    icon: IconName;
    helper: string;
  }[] = [
    {
      label: "Kế hoạch",
      value: tripCountResult.count ?? trips.length,
      icon: "route",
      helper: "đã tạo với NiBi AI",
    },
    {
      label: "Booking",
      value: bookingCountResult.count ?? bookings.length,
      icon: "calendar",
      helper: "yêu cầu đã gửi",
    },
    {
      label: "Đang xử lý",
      value: activeBookingCountResult.count ?? 0,
      icon: "clock",
      helper: "đang chờ xác nhận",
    },
    {
      label: "Đã lưu",
      value: savedCountResult.count ?? savedProducts.length,
      icon: "heart",
      helper: "dịch vụ yêu thích",
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-card sm:rounded-[34px]">
        <div className="grid lg:grid-cols-[1.18fr_.82fr]">
          <div className="relative overflow-hidden bg-brand-green px-6 py-9 text-white sm:px-10 sm:py-12">
            <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border-[50px] border-white/5" />
            <div className="pointer-events-none absolute -bottom-20 right-10 h-52 w-52 rounded-full bg-brand-gold/15 blur-3xl" />
            <div className="relative max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                <Icon name="sparkles" className="h-4 w-4 text-brand-gold" />
                Đồng hành cùng {ENGINE_NAME}
              </span>
              <p className="mt-7 text-sm font-medium text-white/70">Xin chào, {name}</p>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                Chuyến đi Ninh Bình
                <br />
                bắt đầu từ điều bạn thích.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/78 sm:text-base">
                Chia sẻ ngân sách, thời gian và sở thích — nhận ba phương án rõ lịch
                trình, rõ chi phí, luôn có đội ngũ xác nhận.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={ROUTES.plan} variant="secondary" size="lg">
                  <Icon name="sparkles" className="h-5 w-5" />
                  Lập kế hoạch với NiBi AI
                </ButtonLink>
                <a
                  href="#my-plans"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Xem hành trình của tôi
                  <Icon name="arrow-right" className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-white/68">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="shield" className="h-4 w-4 text-brand-gold" />
                  Giá cập nhật thực tế
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="headset" className="h-4 w-4 text-brand-gold" />
                  Đội ngũ xác nhận trước khi đặt
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#fffdf9] p-6 sm:p-8 lg:p-9">
            <QuickTripForm />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-green-soft text-brand-green">
                <Icon name={stat.icon} className="h-[19px] w-[19px]" />
              </span>
              <span className="text-2xl font-extrabold text-brand-ink sm:text-3xl">{stat.value}</span>
            </div>
            <p className="mt-3 text-sm font-bold text-brand-ink">{stat.label}</p>
            <p className="mt-0.5 text-xs text-brand-muted">{stat.helper}</p>
          </Card>
        ))}
      </section>

      {(unfinishedPlan || activeBooking) && (
        <section className="grid gap-3 md:grid-cols-2">
          {unfinishedPlan && (
            <Link
              href={ROUTES.proposals(unfinishedPlan.id)}
              className="group flex items-center gap-4 rounded-2xl border border-brand-green/10 bg-brand-green-soft/70 p-4 transition hover:border-brand-green/25 hover:bg-brand-green-soft"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-brand-green shadow-sm">
                <Icon name="route" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold uppercase tracking-[0.14em] text-brand-green">
                  Tiếp tục kế hoạch
                </span>
                <span className="mt-1 block truncate font-bold text-brand-ink">
                  Ninh Bình · {unfinishedPlan.num_days}N{unfinishedPlan.num_nights}Đ ·{" "}
                  {unfinishedPlan.num_people} người
                </span>
              </span>
              <Icon
                name="chevron-right"
                className="h-5 w-5 text-brand-green transition-transform group-hover:translate-x-1"
              />
            </Link>
          )}
          {activeBooking && (
            <Link
              href={ROUTES.booking(activeBooking.code)}
              className="group flex items-center gap-4 rounded-2xl border border-brand-gold/15 bg-brand-gold-soft/65 p-4 transition hover:border-brand-gold/30 hover:bg-brand-gold-soft"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-[#ad741e] shadow-sm">
                <Icon name="clock" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold uppercase tracking-[0.14em] text-[#ad741e]">
                  Booking đang xử lý
                </span>
                <span className="mt-1 flex items-center gap-2 font-bold text-brand-ink">
                  {activeBooking.code}
                  <Badge tone={bookingStatusTone[activeBooking.status]}>
                    {BOOKING_STATUS_LABELS[activeBooking.status]}
                  </Badge>
                </span>
              </span>
              <Icon
                name="chevron-right"
                className="h-5 w-5 text-[#ad741e] transition-transform group-hover:translate-x-1"
              />
            </Link>
          )}
        </section>
      )}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
              Khám phá theo cách của bạn
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-brand-ink sm:text-2xl">
              Bạn đang tìm điều gì?
            </h2>
          </div>
          <span className="hidden text-xs text-brand-muted sm:block">
            Chọn một chủ đề để NiBi AI hiểu bạn nhanh hơn
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="group rounded-2xl border border-black/5 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:border-brand-green/15 hover:shadow-md"
            >
              <span className={`grid h-11 w-11 place-items-center rounded-2xl ${category.tone}`}>
                <Icon name={category.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-bold text-brand-ink">{category.title}</h3>
              <p className="mt-1 min-h-8 text-xs leading-relaxed text-brand-muted">
                {category.description}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-green">
                Tạo gợi ý
                <Icon
                  name="arrow-right"
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="my-plans" className="grid scroll-mt-24 gap-6 lg:grid-cols-[1.18fr_.82fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
                Hành trình
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-brand-ink">Kế hoạch của bạn</h2>
            </div>
            {trips.length > 0 && (
              <Link
                href={ROUTES.plan}
                className="inline-flex items-center gap-1 text-sm font-bold text-brand-green hover:underline"
              >
                Tạo mới <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
            )}
          </div>

          {trips.length === 0 ? (
            <Card className="border-dashed">
              <div className="flex flex-col items-center px-4 py-7 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-green-soft text-brand-green">
                  <Icon name="compass" className="h-6 w-6" />
                </span>
                <p className="mt-4 font-bold text-brand-ink">Bạn chưa có kế hoạch du lịch nào</p>
                <p className="mt-1 max-w-sm text-sm leading-relaxed text-brand-muted">
                  Nhập nhu cầu chuyến đi, NiBi AI sẽ gợi ý lịch trình Ninh Bình phù hợp với ngân
                  sách và sở thích của bạn.
                </p>
                <div className="mt-5">
                  <ButtonLink href={ROUTES.plan}>Lập kế hoạch với NiBi AI</ButtonLink>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {trips.map((trip) => (
                <Link
                  key={trip.id}
                  href={ROUTES.proposals(trip.id)}
                  className="group flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-card transition hover:border-brand-green/20 hover:shadow-md"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-green-soft text-brand-green">
                    <Icon name="map" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-brand-ink">
                        Ninh Bình · {trip.num_days}N{trip.num_nights}Đ
                      </span>
                      <Badge tone={tripStatusTone[trip.status]}>
                        {TRIP_STATUS_LABELS[trip.status]}
                      </Badge>
                    </span>
                    <span className="mt-1 block text-sm text-brand-muted">
                      {trip.num_people} người · {formatVND(trip.budget)}
                      {trip.start_date
                        ? ` · Khởi hành ${new Date(`${trip.start_date}T00:00:00`).toLocaleDateString(
                            "vi-VN",
                          )}`
                        : ""}
                    </span>
                  </span>
                  <Icon
                    name="chevron-right"
                    className="h-5 w-5 shrink-0 text-brand-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-green"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div id="recent-bookings" className="scroll-mt-24">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
                Theo dõi
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-brand-ink">
                Yêu cầu gần đây
              </h2>
            </div>
            {bookings.length > 0 && (
              <Link
                href={ROUTES.bookings}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-green hover:underline"
              >
                Xem tất cả
                <Icon name="arrow-right" className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          {bookings.length === 0 ? (
            <Card className="flex min-h-56 flex-col items-center justify-center border-dashed text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gold-soft text-[#ad741e]">
                <Icon name="calendar" />
              </span>
              <p className="mt-3 text-sm font-bold text-brand-ink">Chưa có yêu cầu đặt dịch vụ</p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-brand-muted">
                Khi bạn chọn một phương án và gửi yêu cầu, trạng thái xử lý sẽ hiển thị tại đây.
              </p>
            </Card>
          ) : (
            <Card className="divide-y divide-black/5 p-0">
              {bookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={ROUTES.booking(booking.code)}
                  className="group flex items-center gap-3 px-4 py-4 transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-brand-cream/65"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gold-soft text-[#ad741e]">
                    <Icon name="ticket" className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold tracking-wide text-brand-ink">
                      {booking.code}
                    </span>
                    <span className="mt-0.5 block text-xs text-brand-muted">
                      {formatVND(booking.total_price)} · Gửi ngày{" "}
                      {new Date(booking.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </span>
                  <Badge tone={bookingStatusTone[booking.status]}>
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </Badge>
                </Link>
              ))}
            </Card>
          )}
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
                Gợi ý nổi bật
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-brand-ink sm:text-2xl">
                Cảm hứng cho chuyến đi
              </h2>
            </div>
            <span className="hidden text-xs text-brand-muted sm:block">
              Lựa chọn đáng cân nhắc
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
                Bộ sưu tập cá nhân
              </p>
              <h2 className="mt-1 text-lg font-extrabold text-brand-ink">Dịch vụ đã lưu</h2>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-green-soft text-brand-green">
              <Icon name="heart" className="h-[18px] w-[18px]" />
            </span>
          </div>
          <div className="mt-5">
            {savedProducts.length === 0 ? (
              <EmptySaved />
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {savedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`${ROUTES.plan}?interest=${product.tags[0] ?? "nature"}`}
                    className="rounded-xl border border-black/5 bg-brand-cream/70 p-3 transition hover:border-brand-green/20"
                  >
                    <p className="line-clamp-2 text-sm font-bold text-brand-ink">{product.name}</p>
                    <p className="mt-2 text-xs font-semibold text-brand-green">
                      {formatVND(product.price)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-brand-ink text-white">
          <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-brand-gold/15 blur-2xl" />
          <div className="relative flex h-full flex-col justify-between gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
                  Luôn có người thật
                </p>
                <h2 className="mt-2 text-xl font-extrabold">Bạn cần tư vấn nhanh?</h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
                  Bạn có thể xem trước phương án, chi phí và điều kiện. Một tư vấn viên sẽ kiểm tra
                  lại tình trạng còn chỗ trước khi bạn quyết định đặt.
                </p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-brand-gold">
                <Icon name="headset" />
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="https://nibigo.io.vn"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 text-sm font-bold text-brand-ink transition hover:brightness-95"
              >
                Nhận tư vấn
                <Icon name="arrow-right" className="h-4 w-4" />
              </a>
              <span className="inline-flex items-center justify-center gap-2 text-xs text-white/55">
                <Icon name="shield" className="h-4 w-4" />
                Chưa phát sinh đặt chỗ hay thanh toán
              </span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
