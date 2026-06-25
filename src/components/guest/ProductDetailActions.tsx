"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AvailabilityStatus } from "@/types";

export function ProductDetailActions({
  productId,
  productName,
  firstTag,
  availability,
  initialSaved,
  initialAdded,
}: {
  productId: string;
  productName: string;
  firstTag: string;
  availability: AvailabilityStatus;
  initialSaved: boolean;
  initialAdded: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [added, setAdded] = useState(initialAdded);
  const [busy, setBusy] = useState<"saved" | "cart" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const soldOut = availability === "sold_out";
  const plannerHref = `${ROUTES.plan}?interest=${encodeURIComponent(
    firstTag,
  )}&special=${encodeURIComponent(`Tôi muốn đưa dịch vụ "${productName}" vào lịch trình.`)}`;

  async function mutate(kind: "saved" | "cart") {
    const active = kind === "saved" ? saved : added;
    setBusy(kind);
    setMessage(null);
    const response = await fetch(`/api/buyer/${kind === "saved" ? "saved" : "cart"}`, {
      method: active ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });
    const json = await response.json().catch(() => ({}));

    if (response.ok) {
      if (kind === "saved") {
        setSaved(!saved);
        setMessage(saved ? "Đã bỏ lưu dịch vụ." : "Đã lưu dịch vụ để xem sau.");
      } else {
        setAdded(!added);
        setMessage(added ? "Đã bỏ khỏi dịch vụ đã chọn." : "Đã thêm vào dịch vụ đã chọn.");
      }
    } else {
      setMessage(json.error ?? "Không thể cập nhật. Vui lòng thử lại.");
    }
    setBusy(null);
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => mutate("cart")}
        disabled={busy !== null || soldOut}
        className={cn(
          "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
          added
            ? "bg-brand-green-soft text-brand-green"
            : "bg-brand-green text-white hover:bg-brand-green-dark",
        )}
      >
        <Icon name={added ? "check" : "plus"} className="h-5 w-5" />
        {soldOut ? "Dịch vụ hiện tạm hết chỗ" : added ? "Đã thêm vào dịch vụ đã chọn" : "Thêm vào dịch vụ đã chọn"}
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => mutate("saved")}
          disabled={busy !== null}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-full border text-xs font-bold transition disabled:opacity-50",
            saved
              ? "border-brand-gold/25 bg-brand-gold-soft text-[#9f6818]"
              : "border-black/10 text-brand-muted hover:border-brand-green/20 hover:bg-brand-green-soft hover:text-brand-green",
          )}
        >
          <Icon name={saved ? "check" : "heart"} className="h-4 w-4" />
          {saved ? "Đã lưu" : "Lưu dịch vụ"}
        </button>
        <Link
          href={plannerHref}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-brand-green/20 text-xs font-bold text-brand-green transition hover:bg-brand-green-soft"
        >
          <Icon name="sparkles" className="h-4 w-4" />
          Hỏi NiBi AI
        </Link>
      </div>

      <Link
        href={plannerHref}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-gold px-5 text-xs font-bold text-brand-ink transition hover:brightness-95"
      >
        Tạo lịch trình để gửi yêu cầu
        <Icon name="arrow-right" className="h-4 w-4" />
      </Link>

      <p
        aria-live="polite"
        className={cn(
          "min-h-5 text-center text-[11px] font-medium text-brand-muted",
          !message && "invisible",
        )}
      >
        {message ?? "Chưa có cập nhật"}
      </p>
    </div>
  );
}
