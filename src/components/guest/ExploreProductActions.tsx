"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AvailabilityStatus } from "@/types";

export function ExploreProductActions({
  productId,
  firstTag,
  availability,
  initialSaved,
  initialAdded,
}: {
  productId: string;
  firstTag: string;
  availability: AvailabilityStatus;
  initialSaved: boolean;
  initialAdded: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [added, setAdded] = useState(initialAdded);
  const [busy, setBusy] = useState<"saved" | "cart" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function toggleSaved() {
    setBusy("saved");
    setMessage(null);
    const response = await fetch("/api/buyer/saved", {
      method: saved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });
    const json = await response.json().catch(() => ({}));
    if (response.ok) {
      setSaved(!saved);
      setMessage(saved ? "Đã bỏ lưu dịch vụ." : "Đã lưu để xem sau.");
    } else {
      setMessage(json.error ?? "Không thể cập nhật dịch vụ đã lưu.");
    }
    setBusy(null);
  }

  async function toggleCart() {
    setBusy("cart");
    setMessage(null);
    const response = await fetch("/api/buyer/cart", {
      method: added ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });
    const json = await response.json().catch(() => ({}));
    if (response.ok) {
      setAdded(!added);
      setMessage(added ? "Đã bỏ khỏi dịch vụ đã chọn." : "Đã thêm vào dịch vụ đã chọn.");
    } else {
      setMessage(json.error ?? "Không thể cập nhật dịch vụ đã chọn.");
    }
    setBusy(null);
  }

  const soldOut = availability === "sold_out";

  return (
    <div className="flex min-h-[124px] flex-col gap-3">
      <div className="grid grid-cols-[auto_1fr] gap-2">
        <button
          type="button"
          onClick={toggleSaved}
          disabled={busy !== null}
          aria-label={saved ? "Bỏ lưu dịch vụ" : "Lưu dịch vụ"}
          className={cn(
            "grid h-10 w-10 place-items-center rounded-full border transition disabled:opacity-50",
            saved
              ? "border-brand-gold/25 bg-brand-gold-soft text-[#a96e18]"
              : "border-black/10 text-brand-muted hover:border-brand-green/20 hover:bg-brand-green-soft hover:text-brand-green",
          )}
        >
          <Icon name={saved ? "check" : "heart"} className="h-[17px] w-[17px]" />
        </button>
        <button
          type="button"
          onClick={toggleCart}
          disabled={busy !== null || soldOut}
          className={cn(
            "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-45",
            added
              ? "bg-brand-green-soft text-brand-green"
              : "bg-brand-green text-white hover:bg-brand-green-dark",
          )}
        >
          <Icon name={added ? "check" : "plus"} className="h-4 w-4" />
          {soldOut ? "Tạm hết chỗ" : added ? "Đã chọn" : "Thêm dịch vụ"}
        </button>
      </div>

      <Link
        href={`${ROUTES.plan}?interest=${encodeURIComponent(firstTag)}`}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-green/20 px-4 py-2.5 text-xs font-bold text-brand-green transition hover:bg-brand-green-soft"
      >
        <Icon name="sparkles" className="h-4 w-4" />
        Hỏi NiBi AI về dịch vụ này
      </Link>

      <p
        aria-live="polite"
        className={cn(
          "min-h-4 text-center text-[11px] font-medium text-brand-muted",
          !message && "invisible",
        )}
      >
        {message ?? "Chưa có cập nhật"}
      </p>
    </div>
  );
}
