import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge, bookingStatusTone } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { AIMascot } from "@/components/brand/AIMascot";
import { CancelBookingButton } from "@/components/guest/CancelBookingButton";
import { formatVND } from "@/lib/utils";
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  ROUTES,
} from "@/lib/constants";
import type {
  BookingRequest,
  BookingStatusLog,
  PaymentStatus,
  TourPackage,
  TripRequest,
} from "@/types";

export const metadata: Metadata = {
  title: "Xác nhận yêu cầu — NiBiGo AI Travel Platform",
};
export const dynamic = "force-dynamic";

const STATUS_STEPS = [
  {
    key: "new",
    title: "Đã tiếp nhận",
    detail: "Yêu cầu đã được ghi nhận trên hệ thống.",
    icon: "check" as IconName,
  },
  {
    key: "contacted",
    title: "Tư vấn viên liên hệ",
    detail: "Tư vấn viên liên hệ và làm rõ nhu cầu.",
    icon: "headset" as IconName,
  },
  {
    key: "confirmed",
    title: "Xác nhận dịch vụ",
    detail: "Chốt chỗ, chi phí và bước thanh toán.",
    icon: "shield" as IconName,
  },
] as const;

const STATUS_PROGRESS: Record<BookingRequest["status"], number> = {
  new: 0,
  contacted: 1,
  checking_availability: 1,
  waiting_payment: 2,
  confirmed: 2,
  completed: 2,
  cancelled: 0,
};

const CANCELLABLE_STATUSES: BookingRequest["status"][] = [
  "new",
  "contacted",
  "checking_availability",
];

function formatDate(value: string | null) {
  if (!value) return "Linh hoạt";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(`${value}T00:00:00+07:00`));
}

export default async function BookingConfirmationPage({
  params,
}: {
  params: { code: string };
}) {
  const supabase = createClient();

  const { data: bookingData } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("code", params.code)
    .single();
  if (!bookingData) notFound();
  const booking = bookingData as BookingRequest;

  const [{ data: packageData }, { data: tripData }, { data: logData }] = await Promise.all([
    supabase.from("tour_packages").select("*").eq("id", booking.tour_package_id).single(),
    supabase.from("trip_requests").select("*").eq("id", booking.trip_request_id).single(),
    supabase
      .from("booking_status_logs")
      .select("*")
      .eq("booking_request_id", booking.id)
      .order("created_at", { ascending: true }),
  ]);
  const pkg = packageData as TourPackage | null;
  const trip = tripData as TripRequest | null;
  const logs = (logData as BookingStatusLog[] | null) ?? [];
  const currentStep = STATUS_PROGRESS[booking.status];
  const paymentStatus = booking.payment_status ?? "unpaid";

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <section className="overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-card">
        <div className="grid lg:grid-cols-[1.15fr_.85fr]">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#2f7d5c] via-brand-green to-brand-green-dark px-6 py-10 text-white sm:px-9 sm:py-12">
            <span className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border-[46px] border-white/[0.055]" />
            <div className="relative">
              <AIMascot state="success" size="lg" className="-mb-4 -ml-4" priority />
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                Yêu cầu đã được gửi
              </p>
              <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
                Yêu cầu của bạn đã được tiếp nhận.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/[0.75] sm:text-base">
                Tư vấn viên sẽ kiểm tra tình trạng dịch vụ và liên hệ theo thông tin bạn cung cấp.
                Chưa có khoản thanh toán nào phát sinh.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#booking-status"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 text-sm font-bold text-brand-ink transition hover:brightness-95"
                >
                  Xem trạng thái yêu cầu
                  <Icon name="arrow-right" className="h-4 w-4" />
                </a>
                {pkg && (
                  <Link
                    href={ROUTES.tour(pkg.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
                  >
                    Xem lại lịch trình
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center bg-[#fffdf9] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
              Mã booking của bạn
            </p>
            <p className="mt-3 break-all text-3xl font-bold tracking-[0.08em] text-brand-green">
              {booking.code}
            </p>
            <p className="mt-3 text-sm leading-6 text-brand-muted">
              Hãy lưu mã này để tiện trao đổi với tư vấn viên và theo dõi trạng thái xử lý.
            </p>
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-white p-4">
              <span className="text-xs font-semibold text-brand-muted">Trạng thái hiện tại</span>
              <Badge
                tone={bookingStatusTone[booking.status]}
                className="px-3 py-1 text-xs font-bold"
              >
                {BOOKING_STATUS_LABELS[booking.status]}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="space-y-6">
          <section
            id="booking-status"
            className="scroll-mt-24 rounded-[26px] border border-black/5 bg-white p-6 shadow-card sm:p-7"
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
              Tiến trình xử lý
            </p>
            <h2 className="mt-1 text-2xl font-bold text-brand-ink">
              Điều gì sẽ diễn ra tiếp theo?
            </h2>

            {booking.status === "cancelled" ? (
              <div className="mt-6 rounded-2xl bg-status-soldout/10 p-4">
                <p className="font-bold text-status-soldout">Yêu cầu đã được hủy</p>
                <p className="mt-1 text-sm leading-6 text-brand-muted">
                  Nếu bạn vẫn muốn đi, hãy tạo một hành trình mới hoặc gửi yêu cầu tư vấn khác.
                </p>
              </div>
            ) : (
              <ol className="mt-7 grid gap-4 sm:grid-cols-3">
                {STATUS_STEPS.map((step, index) => {
                  const reached = index <= currentStep;
                  const current = index === currentStep;
                  return (
                    <li
                      key={step.key}
                      className={`relative min-h-[176px] rounded-[20px] border p-4 ${
                        current
                          ? "border-brand-green/25 bg-brand-green-soft/[0.65]"
                          : reached
                            ? "border-brand-green/10 bg-white"
                            : "border-black/5 bg-brand-cream/[0.45]"
                      }`}
                    >
                      <span
                        className={`grid h-10 w-10 place-items-center rounded-2xl ${
                          reached
                            ? "bg-brand-green text-white"
                            : "bg-black/5 text-brand-muted"
                        }`}
                      >
                        <Icon name={step.icon} className="h-5 w-5" />
                      </span>
                      <p className="mt-4 text-sm font-bold text-brand-ink">{step.title}</p>
                      <p className="mt-1 text-xs leading-5 text-brand-muted">{step.detail}</p>
                      {current && (
                        <span className="mt-3 inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-brand-green">
                          Đang ở bước này
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section className="rounded-[26px] border border-black/5 bg-white p-6 shadow-card sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
                  Lịch sử cập nhật
                </p>
                <h2 className="mt-1 text-xl font-bold text-brand-ink">
                  Các thay đổi của yêu cầu
                </h2>
              </div>
              <Icon name="clock" className="h-5 w-5 text-brand-green" />
            </div>

            <ol className="mt-6 space-y-0">
              {(logs.length > 0
                ? logs
                : [
                    {
                      id: `${booking.id}-created`,
                      booking_request_id: booking.id,
                      from_status: null,
                      to_status: booking.status,
                      changed_by: null,
                      note: "Yêu cầu được gửi",
                      created_at: booking.created_at,
                    } satisfies BookingStatusLog,
                  ]
              ).map((log, index, all) => (
                <li key={log.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {index < all.length - 1 && (
                    <span className="absolute left-[17px] top-9 h-[calc(100%-20px)] w-px bg-brand-green-soft" />
                  )}
                  <span className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-green-soft text-brand-green">
                    <Icon
                      name={log.to_status === "cancelled" ? "x" : "check"}
                      className="h-4 w-4"
                    />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-brand-ink">
                        {BOOKING_STATUS_LABELS[log.to_status]}
                      </p>
                      <time className="text-[10px] text-brand-muted">
                        {new Intl.DateTimeFormat("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Ho_Chi_Minh",
                        }).format(new Date(log.created_at))}
                      </time>
                    </div>
                    {log.note && (
                      <p className="mt-1 text-xs leading-5 text-brand-muted">{log.note}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-[26px] border border-black/5 bg-white p-6 shadow-card sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
                  Thông tin đã gửi
                </p>
                <h2 className="mt-1 text-xl font-bold text-brand-ink">Liên hệ và ghi chú</h2>
              </div>
              <Icon name="user" className="h-5 w-5 text-brand-green" />
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-brand-cream/[0.65] p-4">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Người liên hệ
                </dt>
                <dd className="mt-1 text-sm font-bold text-brand-ink">{booking.contact_name}</dd>
              </div>
              <div className="rounded-2xl bg-brand-cream/[0.65] p-4">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Điện thoại
                </dt>
                <dd className="mt-1 text-sm font-bold text-brand-ink">{booking.contact_phone}</dd>
              </div>
              {booking.contact_email && (
                <div className="rounded-2xl bg-brand-cream/[0.65] p-4 sm:col-span-2">
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-brand-ink">
                    {booking.contact_email}
                  </dd>
                </div>
              )}
            </dl>

            {booking.note_from_guest && (
              <div className="mt-4 rounded-2xl border border-black/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                  Nội dung ghi chú
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-brand-ink">
                  {booking.note_from_guest}
                </p>
              </div>
            )}
          </section>
        </main>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="rounded-[24px] border border-black/5 bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold">
                  Tóm tắt yêu cầu
                </p>
                <h2 className="mt-1 text-lg font-bold text-brand-ink">
                  {pkg?.name ?? "Hành trình của bạn"}
                </h2>
              </div>
              <Icon name="route" className="h-5 w-5 shrink-0 text-brand-green" />
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-brand-muted">Khởi hành</dt>
                <dd className="font-bold text-brand-ink">{formatDate(trip?.start_date ?? null)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-brand-muted">Thời lượng</dt>
                <dd className="font-bold text-brand-ink">
                  {trip ? `${trip.num_days}N${trip.num_nights}Đ` : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-brand-muted">Số khách</dt>
                <dd className="font-bold text-brand-ink">
                  {trip ? `${trip.num_people} người` : "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-black/5 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                Tổng chi phí dự kiến
              </p>
              <p className="mt-1 text-2xl font-bold text-brand-green">
                {formatVND(booking.total_price)}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-brand-cream/[0.65] p-3">
              <span className="text-xs font-semibold text-brand-muted">Thanh toán</span>
              <Badge tone={paymentStatus === "paid_demo" ? "green" : "neutral"}>
                {PAYMENT_STATUS_LABELS[paymentStatus as PaymentStatus]}
              </Badge>
            </div>
          </section>

          <section className="rounded-[24px] border border-brand-gold/20 bg-brand-gold-soft/[0.45] p-5">
            <div className="flex gap-3">
              <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold" />
              <div>
                <h2 className="font-bold text-brand-ink">Lưu ý về giá</h2>
                <p className="mt-1 text-xs leading-5 text-brand-muted">
                  Tổng tiền đang là mức dự kiến. Giá cuối cùng chỉ được chốt sau khi từng dịch vụ
                  được kiểm tra và bạn đồng ý tiếp tục.
                </p>
              </div>
            </div>
          </section>

          <div className="space-y-2">
            <ButtonLink href={ROUTES.bookings} className="w-full">
              Xem tất cả yêu cầu
              <Icon name="arrow-right" className="h-4 w-4" />
            </ButtonLink>
            <a
              href="https://nibigo.io.vn"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-green/30 px-5 py-2.5 text-sm font-semibold text-brand-green transition-colors hover:bg-brand-green-soft"
            >
              <Icon name="headset" className="h-4 w-4" />
              Nhận hỗ trợ
            </a>
            {CANCELLABLE_STATUSES.includes(booking.status) && (
              <CancelBookingButton
                bookingId={booking.id}
                code={booking.code}
                className="w-full text-status-soldout hover:bg-status-soldout/10"
              />
            )}
            <ButtonLink href={ROUTES.explore} variant="outline" className="w-full">
              Tiếp tục khám phá
            </ButtonLink>
          </div>
        </aside>
      </div>
    </div>
  );
}
