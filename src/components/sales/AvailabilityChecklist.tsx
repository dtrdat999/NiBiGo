"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn, formatVND } from "@/lib/utils";
import {
  AVAILABILITY_CHECK_CATEGORIES,
  AVAILABILITY_CHECK_STATUSES,
} from "@/lib/constants";
import type {
  AvailabilityCheckCategory,
  AvailabilityCheckStatus,
  BookingStatus,
} from "@/types";

type CheckState = { status: AvailabilityCheckStatus; note: string };

const CATEGORY_META: Record<
  AvailabilityCheckCategory,
  { label: string; icon: IconName; helper: string }
> = {
  accommodation: {
    label: "Lưu trú",
    icon: "building",
    helper: "Khách sạn, homestay, resort hoặc điểm nghỉ trong gói.",
  },
  transport: {
    label: "Di chuyển",
    icon: "car",
    helper: "Xe đưa đón, limousine, xe riêng hoặc phương án di chuyển chính.",
  },
  activity: {
    label: "Hoạt động / tour",
    icon: "ticket",
    helper: "Điểm tham quan, vé, trải nghiệm hoặc tour trong lịch trình.",
  },
  restaurant: {
    label: "Ăn uống",
    icon: "utensils",
    helper: "Bữa chính, set menu, nhà hàng hoặc trải nghiệm ẩm thực.",
  },
};

const STATUS_META: Record<
  AvailabilityCheckStatus,
  { label: string; tone: string; helper: string }
> = {
  pending: {
    label: "Chưa kiểm tra",
    tone: "bg-black/5 text-brand-muted",
    helper: "Chưa nên báo chắc với khách.",
  },
  available: {
    label: "Còn phục vụ",
    tone: "bg-brand-green-soft text-brand-green",
    helper: "Có thể giữ trong phương án hiện tại.",
  },
  limited: {
    label: "Còn ít / cần chốt nhanh",
    tone: "bg-brand-gold-soft text-[#9f6818]",
    helper: "Cần báo rõ thời hạn hoặc rủi ro thay đổi.",
  },
  not_available: {
    label: "Không còn phù hợp",
    tone: "bg-status-soldout/10 text-status-soldout",
    helper: "Cần thay thế hoặc báo khách đổi phương án.",
  },
  replaced: {
    label: "Đã thay thế",
    tone: "bg-[#e8eef7] text-[#315f91]",
    helper: "Đã có lựa chọn thay thế để tiếp tục xử lý.",
  },
};

function isBlocking(status: AvailabilityCheckStatus) {
  return status === "pending" || status === "not_available";
}

function isEditable(status: BookingStatus, canMutate: boolean) {
  return canMutate && status === "checking_availability";
}

export function AvailabilityChecklist({
  bookingId,
  status,
  canMutate,
  estimatedTotal,
  initialChecks,
  finalPrice,
  finalPriceNote,
  customerAgreed,
  hasInternalNote,
}: {
  bookingId: string;
  status: BookingStatus;
  canMutate: boolean;
  estimatedTotal: number;
  initialChecks: Record<AvailabilityCheckCategory, CheckState>;
  finalPrice: number | null;
  finalPriceNote: string | null;
  customerAgreed: boolean;
  hasInternalNote: boolean;
}) {
  const router = useRouter();
  const editable = isEditable(status, canMutate);

  const [drafts, setDrafts] = useState<Record<AvailabilityCheckCategory, CheckState>>(
    initialChecks,
  );
  const [finalPriceInput, setFinalPriceInput] = useState(
    finalPrice ? String(finalPrice) : String(estimatedTotal),
  );
  const [finalPriceReason, setFinalPriceReason] = useState("");
  const [confirmNote, setConfirmNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );

  const serviceReady = AVAILABILITY_CHECK_CATEGORIES.every(
    (category) => !isBlocking(initialChecks[category].status),
  );
  const finalPriceConfirmed = finalPrice !== null;
  const contacted = status !== "new";
  const readyToMove =
    serviceReady && finalPriceConfirmed && customerAgreed && hasInternalNote;

  async function postAvailability(body: Record<string, unknown>, key: string) {
    setBusy(key);
    setMessage(null);

    try {
      const response = await fetch(`/api/sales/bookings/${bookingId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json?.error ?? "Chưa thể lưu thay đổi");
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

  async function saveService(category: AvailabilityCheckCategory) {
    const draft = drafts[category];
    const ok = await postAvailability(
      {
        action: "update_service",
        category,
        status: draft.status,
        note: draft.note.trim() || undefined,
      },
      `service-${category}`,
    );
    if (ok) {
      setMessage({
        tone: "success",
        text: `Đã lưu tình trạng ${CATEGORY_META[category].label}.`,
      });
    }
  }

  async function saveFinalPrice() {
    const ok = await postAvailability(
      {
        action: "set_final_price",
        finalPrice: Number(finalPriceInput),
        note: finalPriceReason,
      },
      "final-price",
    );
    if (ok) {
      setFinalPriceReason("");
      setMessage({ tone: "success", text: "Đã xác nhận giá cuối." });
    }
  }

  async function toggleAgreement(next: boolean) {
    const ok = await postAvailability(
      { action: "set_agreement", agreed: next },
      "agreement",
    );
    if (ok) {
      setMessage({
        tone: "success",
        text: next
          ? "Đã ghi nhận khách đồng ý tiếp tục."
          : "Đã bỏ đánh dấu khách đồng ý.",
      });
    }
  }

  async function moveToWaitingPayment() {
    setBusy("confirm");
    setMessage(null);

    try {
      const response = await fetch(`/api/sales/bookings/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStatus: "waiting_payment", note: confirmNote }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json?.error ?? "Chưa thể chuyển trạng thái");
      setConfirmNote("");
      setMessage({
        tone: "success",
        text: "Đã hoàn tất kiểm tra và chuyển booking sang bước chờ thanh toán.",
      });
      router.refresh();
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Chưa thể chuyển trạng thái",
      });
    } finally {
      setBusy(null);
    }
  }

  const readinessItems: { label: string; done: boolean; description: string }[] = [
    {
      label: "Đã liên hệ khách",
      done: contacted,
      description: "Có kết quả liên hệ hoặc booking đã qua bước Mới.",
    },
    {
      label: "4 nhóm dịch vụ đã rõ tình trạng",
      done: serviceReady,
      description: "Không còn mục Chưa kiểm tra hoặc Không còn phù hợp.",
    },
    {
      label: "Giá cuối đã có cơ sở",
      done: finalPriceConfirmed,
      description: "Có số tiền cuối và ghi chú giải thích.",
    },
    {
      label: "Khách đồng ý tiếp tục",
      done: customerAgreed,
      description: "Đã trao đổi để khách biết giá/lịch trình trước khi thanh toán.",
    },
    {
      label: "Có ghi chú nội bộ",
      done: hasInternalNote,
      description: "Có lịch sử để người sau hiểu vì sao chuyển bước.",
    },
  ];

  return (
    <section className="rounded-[26px] border border-black/5 bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
            07 · Xác nhận tình trạng dịch vụ
          </p>
          <h2 className="mt-1 text-xl font-bold text-brand-ink">
            Kiểm tra dịch vụ, giá cuối và sự đồng ý của khách
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-brand-muted">
            Đây là bước để Sales biết phương án còn dùng được không. Không chuyển sang chờ thanh toán khi còn dịch vụ chưa rõ hoặc khách chưa đồng ý tiếp tục.
          </p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-green-soft text-brand-green">
          <Icon name="shield" className="h-5 w-5" />
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

      {status === "new" || status === "contacted" ? (
        <div className="mt-5 rounded-2xl border border-dashed border-black/10 bg-brand-cream/[0.5] p-4 text-sm leading-6 text-brand-muted">
          Bước này sẽ mở khi booking được chuyển sang <strong>Đang kiểm tra dịch vụ</strong>.
          Trước đó, hãy ghi nhận kết quả liên hệ ở phần phía trên.
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {AVAILABILITY_CHECK_CATEGORIES.map((category) => {
              const draft = drafts[category];
              const saved = initialChecks[category];
              const meta = CATEGORY_META[category];
              const statusMeta = STATUS_META[saved.status];

              return (
                <article
                  key={category}
                  className={cn(
                    "flex min-h-[250px] flex-col rounded-2xl border p-4",
                    isBlocking(saved.status)
                      ? "border-brand-gold/25 bg-brand-gold-soft/[0.22]"
                      : "border-black/[0.06]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-green-soft text-brand-green">
                        <Icon name={meta.icon} className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-brand-ink">{meta.label}</h3>
                        <p className="mt-1 text-[11px] leading-5 text-brand-muted">
                          {meta.helper}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-bold",
                        statusMeta.tone,
                      )}
                    >
                      {statusMeta.label}
                    </span>
                  </div>

                  <p className="mt-3 rounded-xl bg-brand-cream/[0.55] px-3 py-2 text-[11px] leading-5 text-brand-muted">
                    {statusMeta.helper}
                  </p>

                  {editable ? (
                    <div className="mt-auto space-y-2 pt-4">
                      <select
                        value={draft.status}
                        onChange={(event) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [category]: {
                              ...prev[category],
                              status: event.target.value as AvailabilityCheckStatus,
                            },
                          }))
                        }
                        className="h-10 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-xs font-semibold text-brand-ink outline-none focus:border-brand-green/35"
                      >
                        {AVAILABILITY_CHECK_STATUSES.map((option) => (
                          <option key={option} value={option}>
                            {STATUS_META[option].label}
                          </option>
                        ))}
                      </select>
                      <textarea
                        value={draft.note}
                        onChange={(event) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [category]: { ...prev[category], note: event.target.value },
                          }))
                        }
                        maxLength={2000}
                        rows={2}
                        placeholder="Ghi chú đối tác, thời hạn giữ giá hoặc phương án thay thế…"
                        className="w-full resize-y rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-xs leading-5 text-brand-ink outline-none focus:border-brand-green/35"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => saveService(category)}
                        disabled={busy !== null}
                        className="w-full px-4 text-xs"
                      >
                        {busy === `service-${category}` ? "Đang lưu…" : "Lưu tình trạng"}
                      </Button>
                    </div>
                  ) : (
                    saved.note && (
                      <p className="mt-3 text-xs leading-5 text-brand-muted">{saved.note}</p>
                    )
                  )}
                </article>
              );
            })}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-2xl border border-black/[0.06] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-brand-ink">Giá cuối</p>
                  <p className="mt-1 text-xs leading-5 text-brand-muted">
                    Giá cuối là mức Sales báo lại sau khi kiểm tra dịch vụ; không ghi đè giá dự kiến ban đầu.
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-bold",
                    finalPriceConfirmed
                      ? "bg-brand-green-soft text-brand-green"
                      : "bg-brand-gold-soft text-[#9f6818]",
                  )}
                >
                  {finalPriceConfirmed ? "Đã xác nhận" : "Chưa có giá cuối"}
                </span>
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-brand-muted">Giá dự kiến khách gửi</dt>
                  <dd className="font-bold text-brand-ink">{formatVND(estimatedTotal)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-brand-muted">Giá cuối sau kiểm tra</dt>
                  <dd className="font-bold text-brand-green">
                    {finalPriceConfirmed ? formatVND(finalPrice as number) : "Chưa xác nhận"}
                  </dd>
                </div>
              </dl>

              {finalPriceNote && !editable && (
                <p className="mt-3 rounded-xl bg-brand-cream/[0.55] px-3 py-2 text-xs leading-5 text-brand-muted">
                  {finalPriceNote}
                </p>
              )}

              {editable && (
                <div className="mt-4 space-y-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={finalPriceInput}
                    onChange={(event) => setFinalPriceInput(event.target.value)}
                    className="h-10 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm font-semibold text-brand-ink outline-none focus:border-brand-green/35"
                  />
                  <textarea
                    value={finalPriceReason}
                    onChange={(event) => setFinalPriceReason(event.target.value)}
                    maxLength={2000}
                    rows={2}
                    placeholder="Cơ sở của giá cuối: đã xác nhận với đối tác nào, giá thay đổi vì sao…"
                    className="w-full resize-y rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-xs leading-5 text-brand-ink outline-none focus:border-brand-green/35"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveFinalPrice}
                    disabled={
                      busy !== null ||
                      finalPriceReason.trim().length < 5 ||
                      !(Number(finalPriceInput) > 0)
                    }
                    className="w-full px-4 text-xs"
                  >
                    <Icon name="wallet" className="h-4 w-4" />
                    {busy === "final-price" ? "Đang lưu…" : "Xác nhận giá cuối"}
                  </Button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-black/[0.06] p-4">
              <p className="text-sm font-bold text-brand-ink">Điều kiện trước khi chuyển bước</p>
              <p className="mt-1 text-xs leading-5 text-brand-muted">
                Các mục này giúp tránh báo quá sớm khi còn thiếu xác nhận từ khách hoặc đối tác.
              </p>

              <ul className="mt-4 space-y-2">
                {readinessItems.map((item) => (
                  <li key={item.label} className="flex gap-3 rounded-xl bg-brand-cream/[0.45] p-3">
                    <span
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full",
                        item.done ? "bg-brand-green text-white" : "bg-black/10 text-brand-muted",
                      )}
                    >
                      <Icon name={item.done ? "check" : "x"} className="h-3.5 w-3.5" />
                    </span>
                    <span>
                      <span className="block text-xs font-bold text-brand-ink">{item.label}</span>
                      <span className="mt-0.5 block text-[11px] leading-5 text-brand-muted">
                        {item.description}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] p-3">
                <div>
                  <p className="text-xs font-bold text-brand-ink">Khách đồng ý tiếp tục</p>
                  <p className="mt-0.5 text-[11px] leading-5 text-brand-muted">
                    Dùng sau khi đã báo rõ lịch trình và giá cuối.
                  </p>
                </div>
                {editable ? (
                  <Button
                    type="button"
                    variant={customerAgreed ? "primary" : "outline"}
                    onClick={() => toggleAgreement(!customerAgreed)}
                    disabled={busy !== null}
                    className="shrink-0 px-4 text-xs"
                  >
                    <Icon name={customerAgreed ? "check" : "plus"} className="h-4 w-4" />
                    {customerAgreed ? "Đã đồng ý" : "Đánh dấu"}
                  </Button>
                ) : (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-bold",
                      customerAgreed
                        ? "bg-brand-green-soft text-brand-green"
                        : "bg-black/5 text-brand-muted",
                    )}
                  >
                    {customerAgreed ? "Đã đồng ý" : "Chưa xác nhận"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {editable && (
            <div className="mt-5 rounded-2xl border border-brand-green/15 bg-brand-green-soft/[0.35] p-4">
              <p className="text-sm font-bold text-brand-ink">
                Hoàn tất kiểm tra và chuyển sang chờ thanh toán
              </p>
              <p className="mt-1 text-xs leading-5 text-brand-muted">
                Chỉ dùng khi dịch vụ đã rõ, giá cuối đã có cơ sở và khách đồng ý tiếp tục. Trạng thái này chưa có nghĩa là dịch vụ đã đặt thành công.
              </p>
              <textarea
                value={confirmNote}
                onChange={(event) => setConfirmNote(event.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="Ví dụ: Đã xác nhận lưu trú, xe, hoạt động; khách đồng ý giá cuối và chờ thông tin thanh toán…"
                className="mt-3 w-full resize-y rounded-2xl border border-black/[0.08] bg-white px-3.5 py-3 text-sm leading-6 text-brand-ink outline-none transition focus:border-brand-green/35 focus:ring-2 focus:ring-brand-green/10"
              />
              {!readyToMove && (
                <p className="mt-2 rounded-xl bg-brand-gold-soft/[0.5] px-3 py-2 text-[11px] leading-5 text-[#9f6818]">
                  Cần hoàn tất các điều kiện ở trên trước khi chuyển sang bước chờ thanh toán.
                </p>
              )}
              <Button
                type="button"
                onClick={moveToWaitingPayment}
                disabled={busy !== null || !readyToMove || confirmNote.trim().length < 5}
                className="mt-3 w-full px-4 text-xs"
              >
                <Icon name="arrow-right" className="h-4 w-4" />
                {busy === "confirm" ? "Đang chuyển…" : "Chuyển sang chờ thanh toán"}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
