"use client";

import { useState } from "react";
import type { TravelProduct, ProductType, PriceUnit, AvailabilityStatus } from "@/types";
import {
  PRODUCT_TYPES,
  PRODUCT_TYPE_LABELS,
  PRICE_UNITS,
  PRICE_UNIT_LABELS,
  AVAILABILITY_STATUSES,
  AVAILABILITY_LABELS,
  TAGS,
  SUITABLE_FOR,
  SUITABLE_FOR_LABELS,
} from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

function Chips({
  options,
  selected,
  onToggle,
  label,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (v: string) => void;
  label: (v: string) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "border-brand-green bg-brand-green-soft text-brand-green"
                : "border-black/10 text-brand-muted hover:bg-black/5",
            )}
          >
            {label(opt)}
          </button>
        );
      })}
    </div>
  );
}

export function ProductForm({
  product,
  onClose,
  onSaved,
}: {
  product: TravelProduct | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [type, setType] = useState<ProductType>(product?.type ?? "activity");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [priceUnit, setPriceUnit] = useState<PriceUnit>(product?.price_unit ?? "per_person");
  const [duration, setDuration] = useState(
    product?.duration_hours != null ? String(product.duration_hours) : "",
  );
  const [quality, setQuality] = useState<number>(product?.quality_score ?? 3);
  const [availability, setAvailability] = useState<AvailabilityStatus>(
    product?.availability_status ?? "available",
  );
  const [tags, setTags] = useState<string[]>(product?.tags ?? []);
  const [suitableFor, setSuitableFor] = useState<string[]>(product?.suitable_for ?? []);
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name,
      type,
      description: description || null,
      price: Number(price) || 0,
      price_unit: priceUnit,
      duration_hours: duration === "" ? null : Number(duration),
      tags,
      suitable_for: suitableFor,
      availability_status: availability,
      quality_score: Number(quality),
      image_url: imageUrl || null,
      is_active: isActive,
    };

    const res = await fetch(product ? `/api/products/${product.id}` : "/api/products", {
      method: product ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(json?.error ?? "Không lưu được. Thử lại.");
      setLoading(false);
      return;
    }
    onSaved();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-brand-ink">Tên dịch vụ *</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="VD: Du thuyền Tràng An" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-brand-ink">Loại *</label>
          <Select value={type} onChange={(e) => setType(e.target.value as ProductType)}>
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>
                {PRODUCT_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-brand-ink">Tình trạng chỗ *</label>
          <Select
            value={availability}
            onChange={(e) => setAvailability(e.target.value as AvailabilityStatus)}
          >
            {AVAILABILITY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {AVAILABILITY_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-brand-ink">Giá (VND) *</label>
          <Input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            placeholder="250000"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-brand-ink">Đơn vị giá *</label>
          <Select value={priceUnit} onChange={(e) => setPriceUnit(e.target.value as PriceUnit)}>
            {PRICE_UNITS.map((u) => (
              <option key={u} value={u}>
                {PRICE_UNIT_LABELS[u]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-brand-ink">Thời lượng (giờ)</label>
          <Input
            type="number"
            min={0}
            step="0.5"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="(tùy chọn)"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-brand-ink">Chất lượng (1–5)</label>
          <Select value={quality} onChange={(e) => setQuality(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-brand-ink">Mô tả</label>
        <Textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả ngắn về dịch vụ…"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-brand-ink">Tags</label>
        <Chips options={TAGS} selected={tags} onToggle={(v) => setTags((s) => toggle(s, v))} label={(v) => v} />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-brand-ink">Phù hợp với</label>
        <Chips
          options={SUITABLE_FOR}
          selected={suitableFor}
          onToggle={(v) => setSuitableFor((s) => toggle(s, v))}
          label={(v) => SUITABLE_FOR_LABELS[v as keyof typeof SUITABLE_FOR_LABELS]}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-brand-ink">URL ảnh (tùy chọn)</label>
        <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
      </div>

      <label className="flex items-center gap-2 text-sm text-brand-ink">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-black/20 text-brand-green focus:ring-brand-green/30"
        />
        Hiển thị (active)
      </label>

      {error && (
        <p className="rounded-lg bg-status-soldout/10 px-3 py-2 text-sm text-status-soldout">{error}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Đang lưu…" : product ? "Lưu thay đổi" : "Thêm dịch vụ"}
        </Button>
      </div>
    </form>
  );
}
