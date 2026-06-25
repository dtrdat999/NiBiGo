import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge, orderStatusTone, paymentStatusTone } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { cn, formatVND } from "@/lib/utils";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  ROUTES,
} from "@/lib/constants";
import type { Order, PaymentStatus, Profile } from "@/types";

export const metadata: Metadata = { title: "Orders — NiBiGo AI Travel Platform" };
export const dynamic = "force-dynamic";

const TABS: { key: string; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending_confirmation", label: ORDER_STATUS_LABELS.pending_confirmation },
  { key: "awaiting_payment", label: ORDER_STATUS_LABELS.awaiting_payment },
  { key: "paid", label: ORDER_STATUS_LABELS.paid },
  { key: "processing", label: ORDER_STATUS_LABELS.processing },
  { key: "completed", label: ORDER_STATUS_LABELS.completed },
  { key: "cancelled", label: ORDER_STATUS_LABELS.cancelled },
];

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

export default async function SalesOrdersPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const status = param(searchParams?.status) ?? "all";
  const supabase = createClient();

  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(120);
  if (status !== "all") query = query.eq("status", status);

  const { data: orderData } = await query;
  const orders = (orderData as Order[] | null) ?? [];

  const userIds = Array.from(new Set(orders.map((order) => order.user_id)));
  const { data: profileData } = userIds.length
    ? await supabase.from("profiles").select("id, full_name, email").in("id", userIds)
    : { data: [] };
  const profileById = new Map(
    ((profileData as Pick<Profile, "id" | "full_name" | "email">[] | null) ?? []).map(
      (profile) => [profile.id, profile],
    ),
  );

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">Orders</p>
        <h1 className="mt-1 text-3xl font-bold text-brand-ink">Đơn dịch vụ (demo)</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
          Đơn khách đặt từ giỏ dịch vụ. Xác nhận, theo dõi thanh toán (demo) và cập nhật trạng thái.
        </p>
      </section>

      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-black/[0.06] bg-white p-1.5 shadow-card">
        {TABS.map((tab) => {
          const active = status === tab.key;
          const href =
            tab.key === "all" ? ROUTES.salesOrders : `${ROUTES.salesOrders}?status=${tab.key}`;
          return (
            <Link
              key={tab.key}
              href={href}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors",
                active ? "bg-brand-green text-white" : "text-brand-muted hover:text-brand-ink",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="grid min-h-56 place-items-center rounded-[26px] border border-black/5 bg-white p-8 text-center shadow-card">
          <div>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-green-soft text-brand-green">
              <Icon name="ticket" className="h-5 w-5" />
            </span>
            <p className="mt-3 font-bold text-brand-ink">Chưa có đơn trong mục này</p>
            <p className="mt-1 text-sm text-brand-muted">
              Đơn sẽ xuất hiện khi khách đặt dịch vụ từ giỏ.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[26px] border border-black/5 bg-white shadow-card">
          <div className="divide-y divide-black/5">
            {orders.map((order) => {
              const buyer = profileById.get(order.user_id);
              return (
                <Link
                  key={order.id}
                  href={ROUTES.salesOrder(order.id)}
                  className="grid gap-3 px-5 py-4 transition-colors hover:bg-brand-cream/[0.4] sm:grid-cols-[1.1fr_.9fr_auto] sm:items-center sm:px-6"
                >
                  <div className="min-w-0">
                    <strong className="text-sm tracking-wide text-brand-ink">{order.code}</strong>
                    <p className="mt-0.5 truncate text-sm text-brand-muted">
                      {buyer?.full_name ?? buyer?.email ?? "Khách"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={orderStatusTone[order.status]}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                    <Badge tone={paymentStatusTone[order.payment_status as PaymentStatus]}>
                      {PAYMENT_STATUS_LABELS[order.payment_status as PaymentStatus]}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-green">
                        {formatVND(order.total_price)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-brand-muted">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-green-soft text-brand-green">
                      <Icon name="chevron-right" className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
