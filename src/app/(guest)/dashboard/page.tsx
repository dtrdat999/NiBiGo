import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge, bookingStatusTone } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { formatVND } from "@/lib/utils";
import {
  ROUTES,
  TRIP_STATUS_LABELS,
  BOOKING_STATUS_LABELS,
  ENGINE_NAME,
} from "@/lib/constants";
import type { TripRequest, TripStatus, BookingRequest } from "@/types";

export const metadata: Metadata = { title: "Bảng điều khiển — NiBiGo AI Travel Platform" };
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
  "id" | "num_days" | "num_nights" | "num_people" | "budget" | "travel_style" | "status" | "created_at"
>;
type BookingRow = Pick<BookingRequest, "id" | "code" | "status" | "total_price" | "created_at">;

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: tripsData }, { data: bookingsData }] = await Promise.all([
    user
      ? supabase.from("profiles").select("full_name").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
    supabase
      .from("trip_requests")
      .select("id, num_days, num_nights, num_people, budget, travel_style, status, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("booking_requests")
      .select("id, code, status, total_price, created_at")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const trips = (tripsData as TripRow[] | null) ?? [];
  const bookings = (bookingsData as BookingRow[] | null) ?? [];

  const name = profile?.full_name?.trim().split(/\s+/).slice(-1)[0] ?? "bạn";
  const activeBookings = bookings.filter((b) => ACTIVE_BOOKING.includes(b.status)).length;

  const stats = [
    { label: "Kế hoạch đã tạo", value: trips.length, icon: "🗺️" },
    { label: "Yêu cầu đặt tour", value: bookings.length, icon: "📋" },
    { label: "Đang được xử lý", value: activeBookings, icon: "⏳" },
  ];

  return (
    <div className="space-y-8">
      {/* ── Hero cá nhân hóa ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-green to-brand-green-dark px-6 py-8 text-white shadow-card sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-brand-gold/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
            Được hỗ trợ bởi {ENGINE_NAME}
          </span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Xin chào, {name} 👋
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
            Nhập nhu cầu chuyến đi — {ENGINE_NAME} sẽ gợi ý 3 gói tour Ninh Bình phù hợp ngân sách
            và sở thích, kèm lịch trình và chi phí minh bạch.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={ROUTES.plan} variant="secondary" size="lg">
              Lập kế hoạch với {ENGINE_NAME}
            </ButtonLink>
            <a
              href="#my-plans"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              Xem kế hoạch của tôi
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 sm:p-5">
            <div className="text-xl sm:text-2xl">{s.icon}</div>
            <p className="mt-2 text-2xl font-extrabold text-brand-green sm:text-3xl">{s.value}</p>
            <p className="mt-0.5 text-xs text-brand-muted sm:text-sm">{s.label}</p>
          </Card>
        ))}
      </section>

      {/* ── Kế hoạch của bạn ── */}
      <section id="my-plans" className="scroll-mt-20">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-brand-ink">Kế hoạch của bạn</h2>
          {trips.length > 0 && (
            <Link href={ROUTES.plan} className="text-sm font-medium text-brand-green hover:underline">
              + Tạo kế hoạch mới
            </Link>
          )}
        </div>

        {trips.length === 0 ? (
          <Card className="border-dashed">
            <div className="flex flex-col items-center px-4 py-8 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-green-soft text-2xl">
                🧭
              </div>
              <p className="mt-4 font-semibold text-brand-ink">Bạn chưa có kế hoạch du lịch nào</p>
              <p className="mt-1 max-w-sm text-sm text-brand-muted">
                Hãy bắt đầu bằng cách nhập nhu cầu chuyến đi — {ENGINE_NAME} sẽ gợi ý lịch trình
                phù hợp cho bạn.
              </p>
              <div className="mt-5">
                <ButtonLink href={ROUTES.plan}>Bắt đầu với {ENGINE_NAME}</ButtonLink>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {trips.map((t) => (
              <Link
                key={t.id}
                href={ROUTES.proposals(t.id)}
                className="group block rounded-2xl border border-black/5 bg-white p-4 shadow-card transition-all hover:border-brand-green/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-brand-ink">
                      Ninh Bình · {t.num_days}N{t.num_nights}Đ
                    </p>
                    <p className="mt-0.5 text-sm text-brand-muted">
                      {t.num_people} người · {formatVND(t.budget)}
                    </p>
                  </div>
                  <Badge tone={tripStatusTone[t.status]}>{TRIP_STATUS_LABELS[t.status]}</Badge>
                </div>
                <p className="mt-3 text-xs text-brand-muted">
                  Tạo ngày {new Date(t.created_at).toLocaleDateString("vi-VN")}
                  <span className="ml-1 text-brand-green opacity-0 transition-opacity group-hover:opacity-100">
                    · Xem gợi ý →
                  </span>
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Yêu cầu đặt gần đây ── */}
      {bookings.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-bold text-brand-ink">Yêu cầu đặt gần đây</h2>
          <Card className="divide-y divide-black/5 p-0">
            {bookings.map((b) => (
              <Link
                key={b.id}
                href={ROUTES.booking(b.code)}
                className="flex items-center justify-between gap-3 px-5 py-4 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-brand-green-soft/30"
              >
                <div className="min-w-0">
                  <p className="font-semibold tracking-wide text-brand-ink">{b.code}</p>
                  <p className="mt-0.5 text-sm text-brand-muted">
                    {formatVND(b.total_price)} · {new Date(b.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <Badge tone={bookingStatusTone[b.status]}>{BOOKING_STATUS_LABELS[b.status]}</Badge>
              </Link>
            ))}
          </Card>
        </section>
      )}

      {/* ── Khám phá + Hỗ trợ ── */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col justify-between gap-4 bg-brand-cream">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏞️</span>
              <h3 className="font-bold text-brand-ink">Khám phá dịch vụ Ninh Bình</h3>
              <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-brand-muted">
                Sắp ra mắt
              </span>
            </div>
            <p className="mt-2 text-sm text-brand-muted">
              Duyệt tour, homestay, khách sạn, trải nghiệm và combo theo danh mục, bộ lọc và bản đồ
              — sắp có trong bản cập nhật tới.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Tour", "Homestay", "Trải nghiệm", "Ẩm thực", "Di chuyển", "Combo"].map((c) => (
              <span
                key={c}
                className="rounded-full border border-black/5 bg-white px-3 py-1 text-xs font-medium text-brand-muted"
              >
                {c}
              </span>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              <h3 className="font-bold text-brand-ink">Cần hỗ trợ?</h3>
            </div>
            <p className="mt-2 text-sm text-brand-muted">
              Sau khi bạn gửi yêu cầu đặt tour, đội ngũ Sales của NiBiGo sẽ liên hệ xác nhận dịch vụ,
              lịch trình và chi phí cuối cùng. Mọi giá đều minh bạch từ dữ liệu thật.
            </p>
          </div>
          <p className="text-sm text-brand-muted">
            Website:{" "}
            <a
              href="https://nibigo.io.vn"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand-green hover:underline"
            >
              nibigo.io.vn
            </a>
          </p>
        </Card>
      </section>
    </div>
  );
}
