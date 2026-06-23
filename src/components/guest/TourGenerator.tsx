"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/**
 * Gọi /api/tours/generate.
 * - auto=true: tự chạy khi mount (dùng khi chưa có gói) + hiển thị loading.
 * - auto=false: render nút "Tạo lại gợi ý".
 * (Phase 6 sẽ thêm bước LLM viết itinerary trong cùng API này.)
 */
export function TourGenerator({
  tripRequestId,
  auto,
}: {
  tripRequestId: string;
  auto: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(auto);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tours/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripRequestId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? "Không dựng được gói tour");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      setLoading(false);
    }
  }, [tripRequestId, router]);

  useEffect(() => {
    if (auto && !started.current) {
      started.current = true;
      run();
    }
  }, [auto, run]);

  // Chế độ nút "Tạo lại"
  if (!auto) {
    return (
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={run} disabled={loading}>
          {loading ? "Đang tạo lại…" : "Tạo lại gợi ý"}
        </Button>
        {error && <span className="text-sm text-status-soldout">{error}</span>}
      </div>
    );
  }

  // Chế độ auto: loading / lỗi
  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-status-soldout/30 bg-white p-8 text-center">
        <p className="text-status-soldout">{error}</p>
        <div className="mt-4">
          <Button variant="outline" onClick={run}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-green/30 border-t-brand-green" />
      <p className="mt-4 font-semibold text-brand-ink">Đang dựng 3 gói tour cho bạn…</p>
      <p className="mt-1 text-sm text-brand-muted">Lọc dịch vụ, tính chi phí và chấm điểm phù hợp.</p>
    </div>
  );
}
