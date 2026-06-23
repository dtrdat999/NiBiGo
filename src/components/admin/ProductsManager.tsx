"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TravelProduct, ProductType, AvailabilityStatus } from "@/types";
import {
  PRODUCT_TYPES,
  PRODUCT_TYPE_LABELS,
  PRICE_UNIT_LABELS,
  AVAILABILITY_STATUSES,
  AVAILABILITY_LABELS,
} from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { ProductForm } from "@/components/admin/ProductForm";
import { formatVND, cn } from "@/lib/utils";

export function ProductsManager({ products }: { products: TravelProduct[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<ProductType | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TravelProduct | null>(null);

  const shown = filter === "all" ? products : products.filter((p) => p.type === filter);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(p: TravelProduct) {
    setEditing(p);
    setModalOpen(true);
  }
  function onSaved() {
    setModalOpen(false);
    startTransition(() => router.refresh());
  }

  async function patch(id: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["all", ...PRODUCT_TYPES] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                filter === t
                  ? "bg-brand-green text-white"
                  : "bg-white text-brand-muted hover:bg-black/5",
              )}
            >
              {t === "all" ? "Tất cả" : PRODUCT_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <Button onClick={openCreate}>+ Thêm dịch vụ</Button>
      </div>

      <p className="text-sm text-brand-muted">
        {shown.length} dịch vụ{isPending && " · đang cập nhật…"}
      </p>

      {/* List */}
      {shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center">
          <p className="text-brand-muted">
            Chưa có dịch vụ nào. Chạy <code className="text-brand-ink">seed.sql</code> hoặc bấm
            “Thêm dịch vụ”.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {shown.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 rounded-xl border border-black/5 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">{PRODUCT_TYPE_LABELS[p.type]}</Badge>
                  <h3 className="truncate font-semibold text-brand-ink">{p.name}</h3>
                  {!p.is_active && <Badge tone="red">Ẩn</Badge>}
                </div>
                <p className="mt-1 text-sm text-brand-muted">
                  <span className="font-medium text-brand-ink">{formatVND(p.price)}</span>{" "}
                  <span className="text-xs">{PRICE_UNIT_LABELS[p.price_unit]}</span>
                  {p.tags.length > 0 && (
                    <span className="ml-2 text-brand-muted/80">· {p.tags.slice(0, 4).join(", ")}</span>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Select
                  aria-label="Tình trạng chỗ"
                  value={p.availability_status}
                  disabled={isPending}
                  onChange={(e) =>
                    patch(p.id, { availability_status: e.target.value as AvailabilityStatus })
                  }
                  className="w-32 py-1.5 text-xs"
                >
                  {AVAILABILITY_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {AVAILABILITY_LABELS[s]}
                    </option>
                  ))}
                </Select>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => patch(p.id, { is_active: !p.is_active })}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
                    p.is_active
                      ? "bg-brand-green-soft text-brand-green"
                      : "bg-black/5 text-brand-muted",
                  )}
                >
                  {p.is_active ? "Đang hiện" : "Đang ẩn"}
                </button>

                <Button variant="outline" onClick={() => openEdit(p)} className="px-3 py-1.5 text-xs">
                  Sửa
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Sửa dịch vụ" : "Thêm dịch vụ"}
      >
        <ProductForm
          key={editing?.id ?? "new"}
          product={editing}
          onClose={() => setModalOpen(false)}
          onSaved={onSaved}
        />
      </Modal>
    </div>
  );
}
