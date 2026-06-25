"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { AIMascot } from "@/components/brand/AIMascot";

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
        <AIMascot state="error" size="md" className="mx-auto" />
        <p className="mt-3 font-bold text-brand-ink">Chưa thể chuẩn bị phương án lúc này</p>
        <p className="mt-1 text-sm text-status-soldout">{error}</p>
        <div className="mt-4">
          <Button variant="outline" onClick={run}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-8 text-center shadow-card sm:p-10">
      <AIMascot state="loading" size="lg" className="mx-auto" showStatusText />
      <p className="mt-5 text-xl font-bold text-brand-ink">Đang tạo 3 phương án cho bạn</p>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-brand-muted">
        Chúng tôi đang cân đối ngân sách, nhịp độ chuyến đi và các dịch vụ phù hợp để bạn có thể
        so sánh rõ ràng trước khi quyết định.
      </p>
      <div className="mx-auto mt-6 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
        {[
          "Đã hiểu nhu cầu của bạn",
          "Đang cân đối với ngân sách",
          "Đang kiểm tra nhịp độ hành trình",
          "Đang chuẩn bị 3 lựa chọn dễ so sánh",
        ].map((label, index) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl bg-brand-cream px-4 py-3">
            <span
              className={`grid h-7 w-7 place-items-center rounded-full ${
                index === 0 ? "bg-brand-green text-white" : "bg-white text-brand-gold"
              }`}
            >
              {index === 0 ? (
                <Icon name="check" className="h-4 w-4" />
              ) : (
                <span className={`h-2 w-2 rounded-full bg-brand-gold ${index === 1 ? "animate-pulse" : ""}`} />
              )}
            </span>
            <span className="text-sm font-semibold text-brand-ink">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
