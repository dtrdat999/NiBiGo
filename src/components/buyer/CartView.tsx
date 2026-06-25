"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge, availabilityTone } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { cn, formatVND } from "@/lib/utils";
import {
  AVAILABILITY_LABELS,
  PRICE_UNIT_LABELS,
  PRODUCT_TYPE_LABELS,
  ROUTES,
} from "@/lib/constants";
import type { AvailabilityStatus, PriceUnit, ProductType } from "@/types";

export type CartLine = {
  product_id: string;
  name: string;
  type: ProductType;
  price: number;
  price_unit: PriceUnit;
  image_url: string | null;
  availability_status: AvailabilityStatus;
  quantity: number;
};

export function CartView({ initialItems }: { initialItems: CartLine[] }) {
  const router = useRouter();
  const [items, setItems] = useState<CartLine[]>(initialItems);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasSoldOut = items.some((item) => item.availability_status === "sold_out");

  async function remove(productId: string) {
    setBusy(`remove-${productId}`);
    setError(null);
    try {
      const response = await fetch("/api/buyer/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json?.error ?? "Chưa thể bỏ dịch vụ");
      }
      setItems((prev) => prev.filter((item) => item.product_id !== productId));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chưa thể bỏ dịch vụ");
    } finally {
      setBusy(null);
    }
  }

  async function checkout() {
    setBusy("checkout");
    setError(null);
    try {
      const response = await fetch("/api/buyer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim() || undefined }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json?.error ?? "Chưa thể đặt dịch vụ");
      router.push(ROUTES.order(json.data.code));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chưa thể đặt dịch vụ");
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-black/10 bg-white p-10 text-center shadow-card">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-green-soft text-2xl">
          🧺
        </span>
        <p className="mt-4 font-bold text-brand-ink">Giỏ dịch vụ đang trống</p>
        <p className="mt-1 text-sm text-brand-muted">
          Khám phá tour, homestay, trải nghiệm… và thêm vào giỏ để đặt.
        </p>
        <div className="mt-5">
          <ButtonLink href={ROUTES.explore}>Khám phá dịch vụ</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.product_id}
            className="flex gap-4 rounded-2xl border border-black/5 bg-white p-3 shadow-card"
          >
            <div
              className="h-20 w-24 shrink-0 rounded-xl bg-brand-green-soft bg-cover bg-center"
              style={
                item.image_url ? { backgroundImage: `url("${item.image_url}")` } : undefined
              }
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">
                    {PRODUCT_TYPE_LABELS[item.type]}
                  </p>
                  <Link
                    href={ROUTES.product(item.product_id)}
                    className="mt-0.5 block truncate font-bold text-brand-ink hover:text-brand-green"
                  >
                    {item.name}
                  </Link>
                </div>
                <Badge tone={availabilityTone[item.availability_status]}>
                  {AVAILABILITY_LABELS[item.availability_status]}
                </Badge>
              </div>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-sm font-extrabold text-brand-green">
                  {formatVND(item.price * item.quantity)}
                  <span className="ml-1 text-[11px] font-medium text-brand-muted">
                    ({formatVND(item.price)} {PRICE_UNIT_LABELS[item.price_unit]} × {item.quantity})
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => remove(item.product_id)}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-status-soldout transition hover:bg-status-soldout/10 disabled:opacity-50"
                >
                  <Icon name="x" className="h-3.5 w-3.5" />
                  Bỏ
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="rounded-3xl border border-black/5 bg-white p-5 shadow-card lg:sticky lg:top-24">
        <h2 className="font-bold text-brand-ink">Tóm tắt đơn</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-brand-muted">Số dịch vụ</dt>
            <dd className="font-semibold text-brand-ink">{items.length}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-black/5 pt-2">
            <dt className="font-bold text-brand-ink">Tạm tính</dt>
            <dd className="text-lg font-extrabold text-brand-green">{formatVND(total)}</dd>
          </div>
        </dl>

        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={2000}
          rows={2}
          placeholder="Ghi chú cho Sales (tuỳ chọn)…"
          className="mt-4 w-full resize-y rounded-xl border border-black/[0.08] px-3 py-2 text-xs leading-5 text-brand-ink outline-none focus:border-brand-green/35"
        />

        {error && (
          <p className="mt-3 rounded-xl bg-status-soldout/10 px-3 py-2 text-xs font-semibold text-status-soldout">
            {error}
          </p>
        )}

        <Button
          type="button"
          onClick={checkout}
          disabled={busy !== null || hasSoldOut}
          className="mt-4 w-full"
        >
          <Icon name="check" className="h-4 w-4" />
          {busy === "checkout" ? "Đang đặt…" : "Đặt dịch vụ"}
        </Button>
        <p className="mt-2 text-center text-[11px] leading-4 text-brand-muted">
          {hasSoldOut
            ? "Có dịch vụ đã hết chỗ — hãy bỏ ra trước khi đặt."
            : "Đặt xong, Sales sẽ xác nhận trước khi bạn thanh toán (demo)."}
        </p>
      </aside>
    </div>
  );
}
