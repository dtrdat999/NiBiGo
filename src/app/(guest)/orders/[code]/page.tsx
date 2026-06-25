import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge, orderStatusTone, paymentStatusTone } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { OrderPayButton } from "@/components/buyer/OrderPayButton";
import { cn, formatVND } from "@/lib/utils";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
  ROUTES,
} from "@/lib/constants";
import type {
  Order,
  OrderItem,
  OrderStatusLog,
  PaymentStatus,
  TravelProduct,
} from "@/types";

export const metadata: Metadata = { title: "Đơn dịch vụ — NiBiGo AI Travel Platform" };
export const dynamic = "force-dynamic";

const NEXT_STEP: Record<Order["status"], string> = {
  pending_confirmation: "Sales đang xem đơn và sẽ xác nhận dịch vụ trước khi yêu cầu thanh toán.",
  awaiting_payment: "Đơn đã được xác nhận. Bạn có thể thanh toán (demo) để tiếp tục.",
  paid: "Đã ghi nhận thanh toán. Sales đang xử lý đơn.",
  processing: "Sales đang chuẩn bị dịch vụ cho bạn.",
  confirmed: "Đơn đã được xác nhận. Hẹn gặp bạn ở Ninh Bình!",
  completed: "Đơn đã hoàn tất. Cảm ơn bạn đã đồng hành cùng NiBiGo.",
  cancelled: "Đơn đã hủy.",
  refund_requested: "Yêu cầu hoàn tiền đang được xử lý.",
  refunded: "Đơn đã được hoàn tiền.",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

export default async function OrderDetailPage({ params }: { params: { code: string } }) {
  const supabase = createClient();
  const { data: orderData } = await supabase
    .from("orders")
    .select("*")
    .eq("code", params.code)
    .single();
  if (!orderData) notFound();
  const order = orderData as Order;

  const [{ data: itemData }, { data: logData }] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", order.id),
    supabase
      .from("order_status_logs")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true }),
  ]);
  const items = (itemData as OrderItem[] | null) ?? [];
  const logs = (logData as OrderStatusLog[] | null) ?? [];

  const productIds = items.map((item) => item.product_id);
  const { data: productData } = productIds.length
    ? await supabase.from("products").select("id, name, type").in("id", productIds)
    : { data: [] };
  const productById = new Map(
    ((productData as Pick<TravelProduct, "id" | "name" | "type">[] | null) ?? []).map(
      (product) => [product.id, product],
    ),
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={ROUTES.orders}
        className="inline-flex items-center gap-2 text-xs font-bold text-brand-muted hover:text-brand-green"
      >
        <span className="rotate-180">
          <Icon name="arrow-right" className="h-4 w-4" />
        </span>
        Đơn của tôi
      </Link>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold">
              Mã đơn
            </p>
            <p className="text-2xl font-extrabold tracking-wider text-brand-green">{order.code}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge tone={orderStatusTone[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
            <Badge tone={paymentStatusTone[order.payment_status as PaymentStatus]}>
              {PAYMENT_STATUS_LABELS[order.payment_status as PaymentStatus]}
            </Badge>
          </div>
        </div>

        <div className="rounded-2xl bg-brand-green-soft/[0.45] p-4 text-sm leading-6 text-brand-ink">
          {NEXT_STEP[order.status]}
        </div>

        {order.status === "awaiting_payment" && <OrderPayButton orderId={order.id} />}
      </Card>

      <Card className="space-y-3">
        <h2 className="font-bold text-brand-ink">Dịch vụ trong đơn ({items.length})</h2>
        <div className="divide-y divide-black/5">
          {items.map((item) => {
            const product = productById.get(item.product_id);
            return (
              <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                    {product ? PRODUCT_TYPE_LABELS[product.type] : "Dịch vụ"}
                  </p>
                  <p className="truncate font-semibold text-brand-ink">
                    {product?.name ?? item.product_id}
                  </p>
                  <p className="text-xs text-brand-muted">
                    {formatVND(item.unit_price)} × {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 font-bold text-brand-green">{formatVND(item.line_total)}</p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between border-t border-black/5 pt-3">
          <span className="font-bold text-brand-ink">Tổng cộng</span>
          <span className="text-lg font-extrabold text-brand-green">
            {formatVND(order.total_price)}
          </span>
        </div>
        {order.note_from_buyer && (
          <p className="rounded-xl bg-brand-cream/[0.6] p-3 text-xs leading-5 text-brand-muted">
            Ghi chú của bạn: {order.note_from_buyer}
          </p>
        )}
      </Card>

      {logs.length > 0 && (
        <Card>
          <h2 className="font-bold text-brand-ink">Lịch sử đơn</h2>
          <ol className="mt-4">
            {logs.map((log, index) => (
              <li key={log.id} className="relative flex gap-3 pb-4 last:pb-0">
                {index < logs.length - 1 && (
                  <span className="absolute left-[15px] top-8 h-[calc(100%-14px)] w-px bg-brand-green-soft" />
                )}
                <span
                  className={cn(
                    "relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full",
                    log.to_status === "cancelled"
                      ? "bg-status-soldout/10 text-status-soldout"
                      : "bg-brand-green-soft text-brand-green",
                  )}
                >
                  <Icon name={log.to_status === "cancelled" ? "x" : "check"} className="h-4 w-4" />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-bold text-brand-ink">
                    {ORDER_STATUS_LABELS[log.to_status]}
                  </p>
                  <p className="mt-0.5 text-[10px] text-brand-muted">
                    {formatDateTime(log.created_at)}
                  </p>
                  {log.note && (
                    <p className="mt-1 text-xs leading-5 text-brand-muted">{log.note}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      <div className="flex justify-center">
        <ButtonLink href={ROUTES.explore} variant="outline">
          Tiếp tục khám phá
        </ButtonLink>
      </div>
    </div>
  );
}
