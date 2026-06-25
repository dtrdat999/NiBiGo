"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function OrderPayButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/buyer/orders/${orderId}/pay`, { method: "POST" });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json?.error ?? "Chưa thể thanh toán");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chưa thể thanh toán");
      setBusy(false);
    }
  }

  return (
    <div>
      <Button type="button" onClick={pay} disabled={busy} className="w-full">
        <Icon name="wallet" className="h-4 w-4" />
        {busy ? "Đang xử lý…" : "Thanh toán demo"}
      </Button>
      {error && (
        <p className="mt-2 rounded-xl bg-status-soldout/10 px-3 py-2 text-xs font-semibold text-status-soldout">
          {error}
        </p>
      )}
      <p className="mt-2 text-center text-[11px] text-brand-muted">
        Đây là môi trường demo — không có giao dịch tiền thật.
      </p>
    </div>
  );
}
