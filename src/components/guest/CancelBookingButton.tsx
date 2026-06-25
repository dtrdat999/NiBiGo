"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { AIMascot } from "@/components/brand/AIMascot";

export function CancelBookingButton({
  bookingId,
  code,
  className,
}: {
  bookingId: string;
  code: string;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json?.error ?? "Chưa thể hủy yêu cầu");
      }
      setOpen(false);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Chưa thể hủy yêu cầu",
      );
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        className={className}
        onClick={() => setOpen(true)}
      >
        Hủy yêu cầu
      </Button>
      <Modal
        open={open}
        onClose={() => !loading && setOpen(false)}
        title="Bạn muốn hủy yêu cầu này?"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-[18px] bg-brand-cream/[0.65] p-4">
            <AIMascot state="thinking" size="sm" className="!h-20 !w-20" />
            <div>
              <p className="text-sm font-bold text-brand-ink">{code}</p>
              <p className="mt-1 text-xs leading-5 text-brand-muted">
                Hành trình đã tạo vẫn được giữ lại. Chỉ yêu cầu tư vấn này sẽ dừng xử lý.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="cancel-reason" className="text-sm font-bold text-brand-ink">
              Lý do hủy <span className="font-normal text-brand-muted">(không bắt buộc)</span>
            </label>
            <Textarea
              id="cancel-reason"
              rows={3}
              maxLength={300}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Ví dụ: Tôi muốn xem lại ngân sách trước…"
              disabled={loading}
              className="mt-2"
            />
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-xl bg-status-soldout/10 p-3">
              <Icon name="x" className="h-4 w-4 shrink-0 text-status-soldout" />
              <p className="text-xs leading-5 text-status-soldout">{error}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Giữ yêu cầu
            </Button>
            <Button
              type="button"
              onClick={cancel}
              disabled={loading}
              className="bg-status-soldout hover:bg-status-soldout/90"
            >
              {loading ? "Đang hủy…" : "Xác nhận hủy"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
