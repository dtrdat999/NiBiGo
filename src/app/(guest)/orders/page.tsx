import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge, orderStatusTone, paymentStatusTone } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { formatVND } from "@/lib/utils";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, ROUTES } from "@/lib/constants";
import type { Order, PaymentStatus } from "@/types";

export const metadata: Metadata = { title: "Đơn của tôi — NiBiGo AI Travel Platform" };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, code, status, payment_status, total_price, created_at")
    .order("created_at", { ascending: false });
  const orders =
    (data as Pick<
      Order,
      "id" | "code" | "status" | "payment_status" | "total_price" | "created_at"
    >[] | null) ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Đơn của tôi</h1>
        <p className="mt-1 text-sm text-brand-muted">Theo dõi trạng thái các đơn dịch vụ đã đặt.</p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed text-center">
          <div className="flex flex-col items-center px-4 py-8">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-green-soft text-2xl">
              🧾
            </span>
            <p className="mt-4 font-semibold text-brand-ink">Bạn chưa có đơn nào</p>
            <p className="mt-1 max-w-sm text-sm text-brand-muted">
              Thêm dịch vụ vào giỏ và đặt đơn để theo dõi tại đây.
            </p>
            <div className="mt-5">
              <ButtonLink href={ROUTES.explore}>Khám phá dịch vụ</ButtonLink>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={ROUTES.order(order.code)}
              className="block rounded-2xl border border-black/5 bg-white p-4 shadow-card transition-all hover:border-brand-green/30 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold tracking-wide text-brand-ink">{order.code}</p>
                  <p className="mt-0.5 text-sm text-brand-muted">
                    {formatVND(order.total_price)} ·{" "}
                    {new Date(order.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge tone={orderStatusTone[order.status]}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                  <Badge tone={paymentStatusTone[order.payment_status as PaymentStatus]}>
                    {PAYMENT_STATUS_LABELS[order.payment_status as PaymentStatus]}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
