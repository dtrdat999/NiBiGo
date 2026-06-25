"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

type Transition = { to: OrderStatus; label: string; danger?: boolean };

const TRANSITIONS: Partial<Record<OrderStatus, Transition[]>> = {
  pending_confirmation: [
    { to: "awaiting_payment", label: "Xác nhận → chờ thanh toán" },
    { to: "cancelled", label: "Hủy đơn", danger: true },
  ],
  awaiting_payment: [{ to: "cancelled", label: "Hủy đơn", danger: true }],
  paid: [
    { to: "processing", label: "Bắt đầu xử lý" },
    { to: "refund_requested", label: "Yêu cầu hoàn tiền" },
  ],
  processing: [
    { to: "confirmed", label: "Xác nhận đơn" },
    { to: "cancelled", label: "Hủy đơn", danger: true },
  ],
  confirmed: [{ to: "completed", label: "Hoàn tất đơn" }],
  refund_requested: [{ to: "refunded", label: "Đã hoàn tiền" }],
};

export function SalesOrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );

  const transitions = TRANSITIONS[status] ?? [];

  async function transition(toStatus: OrderStatus, danger?: boolean) {
    if (danger && !window.confirm("Xác nhận thao tác này? Hành động sẽ được ghi lại.")) return;
    setBusy(toStatus);
    setMessage(null);
    try {
      const response = await fetch(`/api/sales/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStatus, note }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json?.error ?? "Chưa thể cập nhật");
      setNote("");
      setMessage({ tone: "success", text: "Đã cập nhật trạng thái đơn." });
      router.refresh();
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Chưa thể cập nhật",
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-[24px] border border-brand-green/15 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold">
            Xử lý đơn
          </p>
          <h2 className="mt-1 text-lg font-bold text-brand-ink">Cập nhật trạng thái</h2>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-green-soft text-brand-green">
          <Icon name="check" className="h-5 w-5" />
        </span>
      </div>

      {message && (
        <div
          className={cn(
            "mt-4 rounded-2xl px-4 py-3 text-xs font-semibold leading-5",
            message.tone === "success"
              ? "bg-brand-green-soft text-brand-green"
              : "bg-status-soldout/10 text-status-soldout",
          )}
          role="status"
        >
          {message.text}
        </div>
      )}

      {transitions.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-brand-cream/[0.6] p-4 text-sm leading-6 text-brand-muted">
          Đơn đã ở trạng thái cuối — không còn thao tác chuyển trạng thái.
        </p>
      ) : (
        <>
          <p className="mt-5 text-xs font-bold text-brand-ink">Ghi chú xử lý (bắt buộc)</p>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Ví dụ: Đã xác nhận dịch vụ với đối tác, đơn sẵn sàng cho khách thanh toán…"
            className="mt-2 w-full resize-y rounded-2xl border border-black/[0.08] px-3.5 py-3 text-sm leading-6 text-brand-ink outline-none transition focus:border-brand-green/35 focus:ring-2 focus:ring-brand-green/10"
          />
          <div className="mt-3 space-y-2">
            {transitions.map((item) =>
              item.danger ? (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => transition(item.to, true)}
                  disabled={busy !== null || note.trim().length < 5}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-status-soldout/25 px-4 py-2.5 text-xs font-bold text-status-soldout transition hover:bg-status-soldout/10 disabled:pointer-events-none disabled:opacity-50"
                >
                  <Icon name="x" className="h-4 w-4" />
                  {busy === item.to ? "Đang xử lý…" : item.label}
                </button>
              ) : (
                <Button
                  key={item.to}
                  type="button"
                  onClick={() => transition(item.to)}
                  disabled={busy !== null || note.trim().length < 5}
                  className="w-full px-4 text-xs"
                >
                  <Icon name="arrow-right" className="h-4 w-4" />
                  {busy === item.to ? "Đang xử lý…" : item.label}
                </Button>
              ),
            )}
          </div>
        </>
      )}
    </section>
  );
}
