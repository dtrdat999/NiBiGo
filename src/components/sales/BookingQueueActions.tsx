"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function BookingQueueActions({
  bookingId,
  phone,
  canClaim,
}: {
  bookingId: string;
  phone: string;
  canClaim: boolean;
}) {
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function copyPhone() {
    try {
      await navigator.clipboard.writeText(phone);
      setMessage("Đã sao chép số điện thoại");
      window.setTimeout(() => setMessage(null), 1800);
    } catch {
      setMessage("Không thể sao chép tự động");
    }
  }

  async function claim() {
    setClaiming(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/sales/bookings/${bookingId}/claim`, {
        method: "POST",
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json?.error ?? "Chưa thể nhận booking");
      }
      setMessage("Đã nhận xử lý booking");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Chưa thể nhận booking");
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className="relative flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={copyPhone}
        title="Sao chép số điện thoại"
        className="grid h-8 w-8 place-items-center rounded-full text-brand-muted transition-colors hover:bg-brand-green-soft hover:text-brand-green"
      >
        <Icon name="copy" className="h-3.5 w-3.5" />
      </button>
      {canClaim && (
        <Button
          type="button"
          variant="outline"
          onClick={claim}
          disabled={claiming}
          className="h-8 px-3 py-0 text-[11px]"
        >
          <Icon name="plus" className="h-3.5 w-3.5" />
          {claiming ? "Đang nhận…" : "Nhận xử lý"}
        </Button>
      )}
      {message && (
        <span className="absolute right-0 top-10 z-20 w-52 rounded-xl border border-black/5 bg-brand-ink px-3 py-2 text-center text-[10px] leading-4 text-white shadow-card">
          {message}
        </span>
      )}
    </div>
  );
}
