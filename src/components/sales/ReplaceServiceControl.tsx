"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn, formatVND } from "@/lib/utils";
import { AVAILABILITY_LABELS, PRODUCT_TYPE_LABELS } from "@/lib/constants";
import type { AvailabilityStatus, ProductType } from "@/types";

type Alternative = {
  id: string;
  name: string;
  type: ProductType;
  price: number;
  availability_status: AvailabilityStatus;
  tags: string[];
};

export function ReplaceServiceControl({
  bookingId,
  itemId,
}: {
  bookingId: string;
  itemId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<{ name: string; price: number } | null>(null);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPicker() {
    setOpen(true);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/sales/bookings/${bookingId}/alternatives?itemId=${itemId}`,
      );
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json?.error ?? "Không tải được dịch vụ thay thế");
      setCurrent(json.data.current);
      setAlternatives(json.data.alternatives ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dịch vụ thay thế");
    } finally {
      setLoading(false);
    }
  }

  async function confirmReplace() {
    if (!selectedId) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/sales/bookings/${bookingId}/replace-service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, newProductId: selectedId, reason }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json?.error ?? "Chưa thể thay thế dịch vụ");
      setOpen(false);
      setSelectedId(null);
      setReason("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chưa thể thay thế dịch vụ");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={openPicker}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-brand-green/25 px-3 py-1.5 text-[11px] font-bold text-brand-green transition hover:bg-brand-green-soft"
      >
        <Icon name="sliders" className="h-3.5 w-3.5" />
        Tìm dịch vụ thay thế
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-brand-green/20 bg-brand-green-soft/[0.25] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold text-brand-ink">Chọn dịch vụ thay thế</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="grid h-6 w-6 place-items-center rounded-full text-brand-muted hover:bg-black/5"
          aria-label="Đóng"
        >
          <Icon name="x" className="h-3.5 w-3.5" />
        </button>
      </div>

      {current && (
        <p className="mt-1 text-[10px] text-brand-muted">
          Hiện tại: {current.name} · {formatVND(current.price)}
        </p>
      )}

      {error && (
        <p className="mt-2 rounded-lg bg-status-soldout/10 px-2 py-1.5 text-[11px] font-semibold text-status-soldout">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-3 text-[11px] text-brand-muted">Đang tải gợi ý…</p>
      ) : alternatives.length === 0 ? (
        <p className="mt-3 rounded-lg bg-white/70 px-2 py-2 text-[11px] text-brand-muted">
          Chưa có dịch vụ cùng nhóm để thay thế.
        </p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {alternatives.map((alt) => {
            const selected = selectedId === alt.id;
            const gap = current ? alt.price - current.price : 0;
            return (
              <li key={alt.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(alt.id)}
                  className={cn(
                    "w-full rounded-xl border p-2.5 text-left transition",
                    selected
                      ? "border-brand-green bg-white"
                      : "border-black/5 bg-white/70 hover:border-brand-green/30",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-bold text-brand-ink">{alt.name}</span>
                    {selected && <Icon name="check" className="h-4 w-4 shrink-0 text-brand-green" />}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-brand-muted">
                    <span className="rounded-full bg-brand-cream px-2 py-0.5">
                      {PRODUCT_TYPE_LABELS[alt.type]}
                    </span>
                    <span>{AVAILABILITY_LABELS[alt.availability_status]}</span>
                    <span className="font-bold text-brand-green">{formatVND(alt.price)}</span>
                    {gap !== 0 && (
                      <span className={gap > 0 ? "text-[#9f6818]" : "text-brand-green"}>
                        {gap > 0 ? "+" : "−"}
                        {formatVND(Math.abs(gap))}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {alternatives.length > 0 && (
        <>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={2000}
            rows={2}
            placeholder="Lý do thay thế (bắt buộc)…"
            className="mt-3 w-full resize-y rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-xs leading-5 text-brand-ink outline-none focus:border-brand-green/35"
          />
          <p className="mt-1 text-[10px] leading-4 text-brand-muted">
            Sau khi thay, hệ thống tính lại giá; giá cuối và sự đồng ý của khách cần xác nhận lại.
          </p>
          <Button
            type="button"
            onClick={confirmReplace}
            disabled={busy || !selectedId || reason.trim().length < 5}
            className="mt-2 w-full px-4 text-xs"
          >
            <Icon name="check" className="h-4 w-4" />
            {busy ? "Đang thay…" : "Xác nhận thay thế"}
          </Button>
        </>
      )}
    </div>
  );
}
