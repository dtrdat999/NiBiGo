"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { BookingStatus, SalesNoteType } from "@/types";

const NOTE_TYPES: { value: SalesNoteType; label: string }[] = [
  { value: "contact_attempt", label: "Lần liên hệ" },
  { value: "customer_preference", label: "Nhu cầu sau trao đổi" },
  { value: "price_discussion", label: "Trao đổi về chi phí" },
  { value: "partner_confirmation", label: "Xác nhận với đối tác" },
  { value: "risk_warning", label: "Rủi ro cần lưu ý" },
  { value: "follow_up", label: "Việc cần theo dõi" },
  { value: "general", label: "Ghi chú chung" },
];

const NEXT_ACTION: Partial<
  Record<
    BookingStatus,
    {
      toStatus: "contacted" | "checking_availability";
      eyebrow: string;
      title: string;
      description: string;
      placeholder: string;
      button: string;
    }
  >
> = {
  new: {
    toStatus: "contacted",
    eyebrow: "Sau khi đã trao đổi",
    title: "Ghi nhận đã liên hệ khách",
    description:
      "Chỉ cập nhật khi đã thực sự trao đổi được với khách. Cuộc gọi không bắt máy nên được lưu ở phần ghi chú.",
    placeholder:
      "Ví dụ: Đã gọi qua điện thoại. Khách xác nhận ngày đi, số người và muốn giữ mức ngân sách hiện tại…",
    button: "Lưu và đánh dấu đã liên hệ",
  },
  contacted: {
    toStatus: "checking_availability",
    eyebrow: "Nếu khách muốn tiếp tục",
    title: "Bắt đầu kiểm tra dịch vụ",
    description:
      "Ghi lại nhu cầu sau trao đổi để người kiểm tra dịch vụ hiểu đúng điều khách đã đồng ý.",
    placeholder:
      "Ví dụ: Khách tiếp tục quan tâm, đồng ý lịch trình hiện tại và ưu tiên xác nhận khách sạn trước…",
    button: "Chuyển sang kiểm tra dịch vụ",
  },
};

export function SalesBookingActions({
  bookingId,
  status,
  role,
  assignedToCurrentUser,
  hasAssignee,
}: {
  bookingId: string;
  status: BookingStatus;
  role: "sales" | "admin";
  assignedToCurrentUser: boolean;
  hasAssignee: boolean;
}) {
  const router = useRouter();
  const [noteType, setNoteType] = useState<SalesNoteType>("general");
  const [noteContent, setNoteContent] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [busy, setBusy] = useState<"note" | "status" | "cancel" | null>(null);
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  const canMutate = role === "admin" || assignedToCurrentUser;
  const nextAction = NEXT_ACTION[status];
  const canCancel = ["new", "contacted", "checking_availability"].includes(status);

  async function post(path: "notes" | "status", body: Record<string, string>) {
    const response = await fetch(`/api/sales/bookings/${bookingId}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(json?.error ?? "Chưa thể lưu thay đổi");
    }
    return json;
  }

  async function addNote() {
    setBusy("note");
    setMessage(null);
    try {
      await post("notes", {
        content: noteContent,
        noteType,
      });
      setNoteContent("");
      setMessage({ tone: "success", text: "Đã lưu ghi chú nội bộ." });
      router.refresh();
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Chưa thể lưu ghi chú",
      });
    } finally {
      setBusy(null);
    }
  }

  async function transition(
    toStatus: "contacted" | "checking_availability" | "cancelled",
  ) {
    const isCancel = toStatus === "cancelled";
    if (
      isCancel &&
      !window.confirm(
        "Bạn chắc chắn muốn hủy booking này? Hành động sẽ được ghi vào lịch sử xử lý.",
      )
    ) {
      return;
    }

    setBusy(isCancel ? "cancel" : "status");
    setMessage(null);
    try {
      await post("status", {
        toStatus,
        note: isCancel ? cancelReason : actionNote,
      });
      setActionNote("");
      setCancelReason("");
      setMessage({
        tone: "success",
        text: isCancel
          ? "Đã hủy booking và lưu lý do."
          : "Đã cập nhật trạng thái booking.",
      });
      router.refresh();
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Chưa thể cập nhật trạng thái",
      });
    } finally {
      setBusy(null);
    }
  }

  if (!canMutate) {
    return (
      <section className="rounded-[24px] border border-brand-gold/20 bg-brand-gold-soft/[0.4] p-5">
        <div className="flex gap-3">
          <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-muted">
              Quyền thao tác
            </p>
            <h2 className="mt-1 text-lg font-bold text-brand-ink">
              {hasAssignee
                ? "Booking do Sales khác phụ trách"
                : "Hãy nhận xử lý booking trước"}
            </h2>
            <p className="mt-2 text-xs leading-5 text-brand-muted">
              Bạn vẫn có thể đọc toàn bộ hồ sơ. Các thay đổi nghiệp vụ chỉ mở cho
              người đang phụ trách hoặc Admin.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border border-brand-green/15 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold">
            Cập nhật xử lý
          </p>
          <h2 className="mt-1 text-lg font-bold text-brand-ink">
            Hành động có kiểm soát
          </h2>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-green-soft text-brand-green">
          <Icon name="check" className="h-5 w-5" />
        </span>
      </div>

      {message && (
        <div
          className={cn(
            "mt-4 rounded-2xl px-4 py-3 text-xs font-semibold leading-5",
            message.tone === "success"
              ? "bg-brand-green-soft text-brand-green"
              : "bg-status-soldout/10 text-status-soldout",
          )}
          role="status"
        >
          {message.text}
        </div>
      )}

      {nextAction ? (
        <div className="mt-5 rounded-[20px] bg-brand-green-soft/[0.48] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-brand-green">
            {nextAction.eyebrow}
          </p>
          <h3 className="mt-1 font-bold text-brand-ink">{nextAction.title}</h3>
          <p className="mt-2 text-xs leading-5 text-brand-muted">
            {nextAction.description}
          </p>
          <textarea
            value={actionNote}
            onChange={(event) => setActionNote(event.target.value)}
            maxLength={2000}
            rows={4}
            placeholder={nextAction.placeholder}
            className="mt-4 w-full resize-y rounded-2xl border border-black/[0.08] bg-white px-3.5 py-3 text-sm leading-6 text-brand-ink outline-none transition focus:border-brand-green/35 focus:ring-2 focus:ring-brand-green/10"
          />
          <Button
            type="button"
            onClick={() => transition(nextAction.toStatus)}
            disabled={busy !== null || actionNote.trim().length < 5}
            className="mt-3 w-full px-4 text-xs"
          >
            <Icon name="arrow-right" className="h-4 w-4" />
            {busy === "status" ? "Đang cập nhật…" : nextAction.button}
          </Button>
        </div>
      ) : status === "checking_availability" ? (
        <div className="mt-5 rounded-[20px] border border-brand-gold/20 bg-brand-gold-soft/[0.36] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-brand-gold">
            Bước đang thực hiện
          </p>
          <h3 className="mt-1 font-bold text-brand-ink">
            Kiểm tra từng dịch vụ và giá cuối
          </h3>
          <p className="mt-2 text-xs leading-5 text-brand-muted">
            Booking chưa thể chuyển sang chờ thanh toán cho đến khi checklist dịch
            vụ, giá cuối và sự đồng ý của khách được hoàn tất ở bước kế tiếp.
          </p>
        </div>
      ) : (
        <div className="mt-5 rounded-[20px] bg-brand-cream/[0.62] p-4">
          <p className="text-sm font-bold text-brand-ink">
            Không có hành động chuyển trạng thái tại bước này.
          </p>
          <p className="mt-1 text-xs leading-5 text-brand-muted">
            Bạn vẫn có thể lưu ghi chú nội bộ để bổ sung lịch sử xử lý.
          </p>
        </div>
      )}

      <div className="mt-5 border-t border-black/5 pt-5">
        <p className="text-xs font-bold text-brand-ink">Thêm ghi chú nội bộ</p>
        <p className="mt-1 text-[11px] leading-5 text-brand-muted">
          Cuộc gọi không bắt máy, trao đổi giá hoặc rủi ro nên được lưu tại đây;
          ghi chú không tự đổi trạng thái booking.
        </p>
        <select
          value={noteType}
          onChange={(event) => setNoteType(event.target.value as SalesNoteType)}
          className="mt-3 h-10 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-xs font-semibold text-brand-ink outline-none focus:border-brand-green/35"
        >
          {NOTE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <textarea
          value={noteContent}
          onChange={(event) => setNoteContent(event.target.value)}
          maxLength={2000}
          rows={3}
          placeholder="Ghi lại thông tin để lần xử lý sau không bị mất ngữ cảnh…"
          className="mt-2 w-full resize-y rounded-2xl border border-black/[0.08] px-3.5 py-3 text-sm leading-6 text-brand-ink outline-none transition focus:border-brand-green/35 focus:ring-2 focus:ring-brand-green/10"
        />
        <Button
          type="button"
          variant="outline"
          onClick={addNote}
          disabled={busy !== null || noteContent.trim().length < 3}
          className="mt-2 w-full px-4 text-xs"
        >
          <Icon name="plus" className="h-4 w-4" />
          {busy === "note" ? "Đang lưu…" : "Lưu ghi chú"}
        </Button>
      </div>

      {canCancel && (
        <details className="mt-5 border-t border-black/5 pt-4">
          <summary className="cursor-pointer text-xs font-bold text-status-soldout">
            Khách không tiếp tục / Hủy booking
          </summary>
          <p className="mt-2 text-[11px] leading-5 text-brand-muted">
            Lý do hủy là bắt buộc và sẽ hiển thị trong lịch sử xử lý.
          </p>
          <textarea
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Nêu rõ lý do khách không tiếp tục…"
            className="mt-3 w-full resize-y rounded-2xl border border-status-soldout/20 px-3.5 py-3 text-sm leading-6 text-brand-ink outline-none focus:ring-2 focus:ring-status-soldout/10"
          />
          <button
            type="button"
            onClick={() => transition("cancelled")}
            disabled={busy !== null || cancelReason.trim().length < 5}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-status-soldout px-4 py-2.5 text-xs font-bold text-white disabled:pointer-events-none disabled:opacity-50"
          >
            <Icon name="x" className="h-4 w-4" />
            {busy === "cancel" ? "Đang hủy…" : "Xác nhận hủy booking"}
          </button>
        </details>
      )}
    </section>
  );
}
