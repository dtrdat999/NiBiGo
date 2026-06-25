"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Textarea } from "@/components/ui/Textarea";
import { AIMascot } from "@/components/brand/AIMascot";

const SUGGESTIONS = [
  "Lịch nhẹ hơn vì có người lớn tuổi",
  "Giảm ngân sách nhưng giữ trải nghiệm chính",
  "Thêm hoạt động phù hợp trẻ em",
  "Bỏ hoạt động leo núi",
  "Ưu tiên nơi lưu trú đẹp hơn",
  "Thêm trải nghiệm ẩm thực địa phương",
];

export function ReviseBox({ packageId }: { packageId: string }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    function prefill(event: Event) {
      const detail = (event as CustomEvent<{ text?: string }>).detail;
      if (detail?.text) {
        setFeedback(detail.text);
        setError(null);
        setDone(null);
      }
    }

    window.addEventListener("nibigo:prefill-revision", prefill);
    return () => window.removeEventListener("nibigo:prefill-revision", prefill);
  }, []);

  async function submit(text: string) {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setDone(null);
    try {
      const res = await fetch("/api/tours/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, feedback: text }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Không chỉnh được tour");
      setDone(json?.data?.intent_summary ?? "Lịch trình đã được cập nhật");
      setFeedback("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          rows={4}
          maxLength={500}
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          placeholder="Ví dụ: Bỏ Hang Múa vì đoàn có người lớn tuổi và thay bằng một trải nghiệm nhẹ nhàng hơn…"
          disabled={loading}
          className="min-h-28 pb-8"
        />
        <span className="absolute bottom-3 right-3 text-[10px] text-brand-muted">
          {feedback.length}/500
        </span>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">
          Gợi ý yêu cầu
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={loading}
              onClick={() => setFeedback(suggestion)}
              className="rounded-full border border-brand-green/15 bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-muted transition-colors hover:border-brand-green/30 hover:bg-brand-green-soft hover:text-brand-green disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-status-soldout/10 px-3 py-2">
          <AIMascot state="error" size="sm" className="!h-14 !w-14" />
          <p className="text-xs leading-5 text-status-soldout">{error}</p>
        </div>
      )}
      {done && (
        <div className="flex items-center gap-3 rounded-xl bg-brand-green-soft px-3 py-2">
          <AIMascot state="success" size="sm" className="!h-14 !w-14" />
          <p className="text-xs font-semibold leading-5 text-brand-green">{done}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 rounded-xl border border-brand-green/10 bg-white px-3 py-2">
          <AIMascot state="loading" size="sm" className="!h-16 !w-16" />
          <div>
            <p className="text-xs font-bold text-brand-ink">Đang xem lại yêu cầu của bạn</p>
            <p className="mt-0.5 text-[11px] leading-5 text-brand-muted">
              Lịch trình và tổng chi phí sẽ được cập nhật để bạn xem lại trước khi tiếp tục.
            </p>
          </div>
        </div>
      )}

      <Button
        onClick={() => submit(feedback)}
        disabled={loading || !feedback.trim()}
        className="w-full"
      >
        <Icon name="sparkles" className="h-4 w-4" />
        {loading ? "Đang cập nhật và tính lại giá…" : "Cập nhật lịch trình"}
      </Button>

      <p className="flex gap-2 text-[11px] leading-5 text-brand-muted">
        <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
        Mọi thay đổi đều hiển thị lại lịch trình và chi phí để bạn kiểm tra trước khi gửi yêu cầu.
      </p>
    </div>
  );
}
