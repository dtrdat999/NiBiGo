"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import {
  CONTACT_STATUSES,
  FOLLOW_UP_TYPES,
} from "@/lib/constants";
import type {
  BookingFollowUp,
  BookingStatus,
  ContactStatus,
  FollowUpStatus,
  FollowUpType,
} from "@/types";

const CONTACT_TONE: Record<ContactStatus, "neutral" | "green" | "gold" | "amber" | "red"> = {
  not_contacted: "neutral",
  contacted: "green",
  no_response: "amber",
  interested: "gold",
  negotiating: "gold",
  confirmed: "green",
  lost: "red",
};

const CONTACT_LABELS: Record<ContactStatus, string> = {
  not_contacted: "Chưa liên hệ",
  contacted: "Đã liên hệ",
  no_response: "Chưa phản hồi",
  interested: "Khách còn quan tâm",
  negotiating: "Đang trao đổi thêm",
  confirmed: "Khách đồng ý tiếp tục",
  lost: "Không tiếp tục",
};

const FOLLOWUP_TONE: Record<FollowUpStatus, "neutral" | "green" | "gold"> = {
  open: "gold",
  done: "green",
  cancelled: "neutral",
};

const FOLLOWUP_STATUS_LABELS: Record<FollowUpStatus, string> = {
  open: "Đang chờ",
  done: "Đã xong",
  cancelled: "Đã hủy",
};

const FOLLOWUP_TYPE_LABELS: Record<FollowUpType, string> = {
  call_attempt: "Gọi điện",
  zalo_message: "Nhắn Zalo",
  email_sent: "Gửi email",
  callback_requested: "Khách hẹn gọi lại",
  price_discussion: "Trao đổi giá",
  itinerary_discussion: "Trao đổi lịch trình",
  waiting_partner: "Chờ đối tác xác nhận",
};

const POSITIVE_CONTACT_STATUSES: ContactStatus[] = [
  "interested",
  "negotiating",
  "confirmed",
];

function formatDateTime(value: string | null) {
  if (!value) return "Chưa có";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

function canCreateFollowup(status: BookingStatus) {
  return !["completed", "cancelled"].includes(status);
}

export function ContactFollowUp({
  bookingId,
  bookingStatus,
  canMutate,
  phone,
  email,
  preferredChannel,
  contactStatus,
  lastContactedAt,
  followups,
}: {
  bookingId: string;
  bookingStatus: BookingStatus;
  canMutate: boolean;
  phone: string;
  email: string | null;
  preferredChannel: string | null;
  contactStatus: ContactStatus;
  lastContactedAt: string | null;
  followups: BookingFollowUp[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );
  const [statusDraft, setStatusDraft] = useState<ContactStatus>(contactStatus);
  const [statusNote, setStatusNote] = useState("");
  const [handoffNote, setHandoffNote] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [followType, setFollowType] = useState<FollowUpType>("call_attempt");
  const [followContent, setFollowContent] = useState("");
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [resultNote, setResultNote] = useState("");

  const openFollowups = followups.filter((item) => item.status === "open");
  const nextFollowup = [...openFollowups].sort((a, b) =>
    a.due_at.localeCompare(b.due_at),
  )[0];
  const positiveContact = POSITIVE_CONTACT_STATUSES.includes(contactStatus);
  const canMoveToServiceCheck =
    canMutate && bookingStatus === "contacted" && positiveContact;

  async function post(path: "contact" | "status", body: Record<string, unknown>) {
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

  async function saveContactStatus() {
    setBusy("status");
    setMessage(null);

    try {
      await post("contact", {
        action: "set_contact_status",
        status: statusDraft,
        note: bookingStatus === "new" ? undefined : statusNote.trim() || undefined,
      });

      if (bookingStatus === "new" && statusDraft !== "not_contacted") {
        await post("status", {
          toStatus: "contacted",
          note: statusNote.trim() || `Đã liên hệ khách: ${CONTACT_LABELS[statusDraft]}.`,
        });
      }

      setStatusNote("");
      setMessage({
        tone: "success",
        text:
          bookingStatus === "new" && statusDraft !== "not_contacted"
            ? "Đã ghi nhận lần liên hệ và chuyển booking sang bước đã liên hệ."
            : "Đã cập nhật trạng thái liên hệ.",
      });
      router.refresh();
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Chưa thể cập nhật liên hệ",
      });
    } finally {
      setBusy(null);
    }
  }

  async function startServiceCheck() {
    setBusy("handoff");
    setMessage(null);

    try {
      await post("status", {
        toStatus: "checking_availability",
        note: handoffNote,
      });
      setHandoffNote("");
      setMessage({
        tone: "success",
        text: "Đã chuyển sang bước kiểm tra tình trạng dịch vụ.",
      });
      router.refresh();
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Chưa thể chuyển bước",
      });
    } finally {
      setBusy(null);
    }
  }

  async function callContact(body: Record<string, unknown>, key: string) {
    setBusy(key);
    setMessage(null);

    try {
      await post("contact", body);
      router.refresh();
      return true;
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Chưa thể lưu thay đổi",
      });
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function createFollowup() {
    const ok = await callContact(
      {
        action: "create_followup",
        dueAt: new Date(dueAt).toISOString(),
        followUpType: followType,
        content: followContent,
      },
      "create",
    );
    if (ok) {
      setDueAt("");
      setFollowContent("");
      setMessage({ tone: "success", text: "Đã tạo lịch follow-up." });
    }
  }

  async function completeFollowup(followupId: string) {
    const ok = await callContact(
      { action: "complete_followup", followupId, resultNote },
      `complete-${followupId}`,
    );
    if (ok) {
      setCompletingId(null);
      setResultNote("");
      setMessage({ tone: "success", text: "Đã ghi nhận kết quả follow-up." });
    }
  }

  async function cancelFollowup(followupId: string) {
    if (!window.confirm("Hủy follow-up này?")) return;

    const ok = await callContact(
      { action: "cancel_followup", followupId },
      `cancel-${followupId}`,
    );
    if (ok) setMessage({ tone: "success", text: "Đã hủy follow-up." });
  }

  const statusNoteRequired = bookingStatus === "new" && statusDraft !== "not_contacted";

  return (
    <section className="rounded-[26px] border border-black/5 bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
            04 · Liên hệ khách trước khi kiểm tra dịch vụ
          </p>
          <h2 className="mt-1 text-xl font-bold text-brand-ink">
            Ghi nhận kết quả liên hệ và bước tiếp theo
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-brand-muted">
            Mục tiêu là biết khách còn muốn tiếp tục không, có đổi nhu cầu nào không và khi nào cần nhắc lại. Đây chưa phải xác nhận đặt dịch vụ.
          </p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-green-soft text-brand-green">
          <Icon name="headset" className="h-5 w-5" />
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

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-black/[0.06] bg-brand-cream/[0.38] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-brand-ink">Tình trạng hiện tại</p>
            <Badge tone={CONTACT_TONE[contactStatus]}>{CONTACT_LABELS[contactStatus]}</Badge>
          </div>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-brand-muted">Kênh ưu tiên</dt>
              <dd className="font-semibold text-brand-ink">
                {preferredChannel || "Chưa rõ"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-brand-muted">Lần liên hệ gần nhất</dt>
              <dd className="font-semibold text-brand-ink">{formatDateTime(lastContactedAt)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-brand-muted">Follow-up kế tiếp</dt>
              <dd className="font-semibold text-brand-ink">
                {nextFollowup ? formatDateTime(nextFollowup.due_at) : "Chưa đặt"}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`tel:${phone}`}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-full bg-brand-green px-4 text-xs font-bold text-white"
            >
              <Icon name="headset" className="h-4 w-4" />
              Gọi khách
            </a>
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-full border border-brand-green/25 px-4 text-xs font-bold text-brand-green transition hover:bg-brand-green-soft"
              >
                <Icon name="arrow-right" className="h-4 w-4 -rotate-45" />
                Email
              </a>
            )}
          </div>

          {!canMutate && (
            <p className="mt-4 rounded-xl bg-brand-gold-soft/[0.45] px-3 py-2 text-[11px] leading-5 text-[#9f6818]">
              Bạn có thể đọc thông tin liên hệ, nhưng chỉ người phụ trách hoặc Admin mới được cập nhật.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-black/[0.06] p-4">
          <p className="text-sm font-bold text-brand-ink">Ghi nhận lần liên hệ</p>
          <p className="mt-1 text-xs leading-5 text-brand-muted">
            Nếu đây là lần xử lý đầu tiên, hệ thống sẽ chuyển booking từ “Mới” sang “Đã liên hệ”.
          </p>

          <select
            value={statusDraft}
            onChange={(event) => setStatusDraft(event.target.value as ContactStatus)}
            disabled={!canMutate}
            className="mt-3 h-10 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-xs font-semibold text-brand-ink outline-none focus:border-brand-green/35 disabled:opacity-60"
          >
            {CONTACT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {CONTACT_LABELS[status]}
              </option>
            ))}
          </select>

          <textarea
            value={statusNote}
            onChange={(event) => setStatusNote(event.target.value)}
            maxLength={2000}
            rows={3}
            disabled={!canMutate}
            placeholder="Ghi rõ kết quả: đã gọi, khách muốn đổi gì, có cần gọi lại hay không…"
            className="mt-2 w-full resize-y rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-xs leading-5 text-brand-ink outline-none focus:border-brand-green/35 disabled:opacity-60"
          />

          <Button
            type="button"
            variant="outline"
            onClick={saveContactStatus}
            disabled={
              busy !== null ||
              !canMutate ||
              (statusDraft === contactStatus && !statusNote.trim()) ||
              (statusNoteRequired && statusNote.trim().length < 5)
            }
            className="mt-2 w-full px-4 text-xs"
          >
            <Icon name="check" className="h-4 w-4" />
            {busy === "status" ? "Đang lưu…" : "Lưu kết quả liên hệ"}
          </Button>
        </div>
      </div>

      {bookingStatus === "contacted" && (
        <div className="mt-5 rounded-2xl border border-brand-green/10 bg-brand-green-soft/[0.35] p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-brand-green">
              <Icon name="shield" className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-brand-ink">
                Chuyển sang kiểm tra tình trạng dịch vụ
              </p>
              <p className="mt-1 text-xs leading-5 text-brand-muted">
                Chỉ chuyển bước khi khách còn quan tâm hoặc đã đồng ý tiếp tục. Sau bước này Sales sẽ kiểm tra lưu trú, xe, hoạt động, ăn uống và giá cuối.
              </p>
              <textarea
                value={handoffNote}
                onChange={(event) => setHandoffNote(event.target.value)}
                maxLength={2000}
                rows={3}
                disabled={!canMutate}
                placeholder="Ví dụ: Khách còn quan tâm, ưu tiên giữ lịch nhẹ, cần xác nhận khách sạn và xe trước…"
                className="mt-3 w-full resize-y rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-xs leading-5 text-brand-ink outline-none focus:border-brand-green/35 disabled:opacity-60"
              />
              {!positiveContact && (
                <p className="mt-2 rounded-xl bg-brand-gold-soft/[0.5] px-3 py-2 text-[11px] leading-5 text-[#9f6818]">
                  Hãy cập nhật trạng thái liên hệ thành “Khách còn quan tâm”, “Đang trao đổi thêm” hoặc “Khách đồng ý tiếp tục” trước khi chuyển bước.
                </p>
              )}
              <Button
                type="button"
                onClick={startServiceCheck}
                disabled={
                  busy !== null ||
                  !canMoveToServiceCheck ||
                  handoffNote.trim().length < 5
                }
                className="mt-3 w-full px-4 text-xs"
              >
                <Icon name="arrow-right" className="h-4 w-4" />
                {busy === "handoff" ? "Đang chuyển…" : "Bắt đầu kiểm tra dịch vụ"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {canMutate && canCreateFollowup(bookingStatus) && (
        <div className="mt-5 rounded-2xl border border-black/[0.06] p-4">
          <p className="text-sm font-bold text-brand-ink">Tạo follow-up</p>
          <p className="mt-1 text-xs leading-5 text-brand-muted">
            Dùng khi khách hẹn gọi lại, chưa phản hồi hoặc cần chờ đối tác kiểm tra.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-[190px_190px_1fr_auto]">
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
              className="h-10 rounded-xl border border-black/[0.08] bg-white px-3 text-xs font-semibold text-brand-ink outline-none focus:border-brand-green/35"
            />
            <select
              value={followType}
              onChange={(event) => setFollowType(event.target.value as FollowUpType)}
              className="h-10 rounded-xl border border-black/[0.08] bg-white px-3 text-xs font-semibold text-brand-ink outline-none focus:border-brand-green/35"
            >
              {FOLLOW_UP_TYPES.map((type) => (
                <option key={type} value={type}>
                  {FOLLOW_UP_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            <input
              value={followContent}
              onChange={(event) => setFollowContent(event.target.value)}
              maxLength={2000}
              placeholder="Nội dung cần nhắc lại…"
              className="h-10 rounded-xl border border-black/[0.08] bg-white px-3 text-xs text-brand-ink outline-none focus:border-brand-green/35"
            />
            <Button
              type="button"
              onClick={createFollowup}
              disabled={busy !== null || !dueAt || followContent.trim().length < 3}
              className="h-10 px-4 text-xs"
            >
              <Icon name="plus" className="h-4 w-4" />
              {busy === "create" ? "Đang lưu…" : "Tạo"}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-5 border-t border-black/5 pt-4">
        <p className="text-xs font-bold text-brand-ink">
          Lịch follow-up và kết quả liên hệ ({followups.length})
        </p>

        {followups.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-brand-cream/[0.55] p-3 text-xs leading-5 text-brand-muted">
            Chưa có follow-up nào. Nếu khách chưa phản hồi hoặc cần chờ xác nhận, hãy tạo một lịch nhắc để không bỏ sót.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {followups.map((item) => (
              <li key={item.id} className="rounded-2xl border border-black/[0.06] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-brand-ink">
                    {FOLLOW_UP_TYPE_LABELS[item.follow_up_type]}
                  </span>
                  <Badge tone={FOLLOWUP_TONE[item.status]}>
                    {FOLLOWUP_STATUS_LABELS[item.status]}
                  </Badge>
                </div>
                <p className="mt-1 text-[10px] text-brand-muted">
                  Hẹn: {formatDateTime(item.due_at)}
                </p>
                <p className="mt-1 text-xs leading-5 text-brand-ink">{item.content}</p>
                {item.result_note && (
                  <p className="mt-2 rounded-lg bg-brand-cream/[0.6] px-2 py-1 text-[11px] leading-5 text-brand-muted">
                    {item.result_note}
                  </p>
                )}

                {canMutate && item.status === "open" && (
                  <div className="mt-3">
                    {completingId === item.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={resultNote}
                          onChange={(event) => setResultNote(event.target.value)}
                          maxLength={2000}
                          rows={2}
                          placeholder="Kết quả follow-up…"
                          className="w-full resize-y rounded-xl border border-black/[0.08] px-3 py-2 text-xs leading-5 text-brand-ink outline-none focus:border-brand-green/35"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => completeFollowup(item.id)}
                            disabled={busy !== null || resultNote.trim().length < 3}
                            className="flex-1 px-3 text-xs"
                          >
                            {busy === `complete-${item.id}` ? "Đang lưu…" : "Lưu kết quả"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setCompletingId(null);
                              setResultNote("");
                            }}
                            disabled={busy !== null}
                            className="px-3 text-xs"
                          >
                            Bỏ
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setCompletingId(item.id);
                            setResultNote("");
                          }}
                          disabled={busy !== null}
                          className="flex-1 px-3 text-xs"
                        >
                          <Icon name="check" className="h-4 w-4" />
                          Hoàn thành
                        </Button>
                        <button
                          type="button"
                          onClick={() => cancelFollowup(item.id)}
                          disabled={busy !== null}
                          className="inline-flex items-center justify-center gap-1 rounded-full border border-status-soldout/20 px-3 text-xs font-bold text-status-soldout disabled:opacity-50"
                        >
                          <Icon name="x" className="h-3.5 w-3.5" />
                          Hủy
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
