import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge, bookingStatusTone } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { formatVND } from "@/lib/utils";
import { BOOKING_STATUS_LABELS, ROUTES } from "@/lib/constants";
import type { BookingRequest } from "@/types";

export const metadata: Metadata = { title: "Xác nhận yêu cầu — NiBiGo AI Travel Platform" };
export const dynamic = "force-dynamic";

export default async function BookingConfirmationPage({ params }: { params: { code: string } }) {
  const supabase = createClient();

  const { data: bookingData } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("code", params.code)
    .single();
  if (!bookingData) notFound();
  const booking = bookingData as BookingRequest;

  const { data: pkg } = await supabase
    .from("tour_packages")
    .select("name")
    .eq("id", booking.tour_package_id)
    .single();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Card className="text-center">
        <div className="text-4xl">🎉</div>
        <h1 className="mt-3 text-2xl font-bold text-brand-ink">Đã gửi yêu cầu đặt tour!</h1>
        <p className="mt-1 text-brand-muted">Cảm ơn bạn. Đội ngũ NiBiGo sẽ sớm liên hệ xác nhận.</p>

        <div className="mt-5 rounded-2xl bg-brand-green-soft/60 p-5">
          <p className="text-sm text-brand-muted">Mã yêu cầu của bạn</p>
          <p className="mt-1 text-2xl font-extrabold tracking-wider text-brand-green">{booking.code}</p>
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-brand-ink">Chi tiết</h2>
          <Badge tone={bookingStatusTone[booking.status]}>{BOOKING_STATUS_LABELS[booking.status]}</Badge>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-brand-muted">Gói tour</dt>
            <dd className="font-medium text-brand-ink">{pkg?.name ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-brand-muted">Tổng dự kiến</dt>
            <dd className="font-bold text-brand-ink">{formatVND(booking.total_price)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-brand-muted">Liên hệ</dt>
            <dd className="font-medium text-brand-ink">
              {booking.contact_name} · {booking.contact_phone}
            </dd>
          </div>
        </dl>
      </Card>

      <div className="rounded-2xl border border-black/5 bg-white p-5 text-sm text-brand-muted">
        <p className="font-semibold text-brand-ink">Bước tiếp theo</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4">
          <li>Sales NiBiGo xem yêu cầu và liên hệ bạn để xác nhận dịch vụ, lịch trình.</li>
          <li>Hai bên chốt chi phí cuối cùng (đây là môi trường demo — chưa thanh toán thật).</li>
          <li>Bạn theo dõi trạng thái yêu cầu ở đây.</li>
        </ol>
      </div>

      <div className="flex justify-center">
        <ButtonLink href={ROUTES.dashboard} variant="outline">
          Về bảng điều khiển
        </ButtonLink>
      </div>
    </div>
  );
}
