"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

const SUGGESTIONS = ["Lịch nhẹ hơn, đỡ mệt", "Giảm ngân sách", "Thêm hoạt động cho trẻ em"];

export function ReviseBox({ packageId }: { packageId: string }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

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
      setDone(json?.data?.intent_summary ?? "Đã cập nhật tour");
      setFeedback("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Textarea
        rows={2}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="VD: Bỏ Hang Múa vì sợ mệt, thêm hoạt động nhẹ hơn…"
        disabled={loading}
      />
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={loading}
            onClick={() => {
              setFeedback(s);
              submit(s);
            }}
            className="rounded-full border border-black/10 px-2.5 py-1 text-xs text-brand-muted hover:bg-black/5 disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-status-soldout">{error}</p>}
      {done && <p className="text-sm text-brand-green">✓ {done}</p>}

      <Button onClick={() => submit(feedback)} disabled={loading || !feedback.trim()} className="w-full">
        {loading ? "AI đang chỉnh tour…" : "Chỉnh tour bằng AI"}
      </Button>
    </div>
  );
}
