"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { AIMascot } from "@/components/brand/AIMascot";

const CONTACT_CHANNELS: {
  value: "phone" | "zalo" | "email";
  label: string;
  detail: string;
  icon: IconName;
}[] = [
  {
    value: "phone",
    label: "Điện thoại",
    detail: "Sales gọi trực tiếp",
    icon: "headset",
  },
  {
    value: "zalo",
    label: "Zalo",
    detail: "Trao đổi và gửi tài liệu",
    icon: "user",
  },
  {
    value: "email",
    label: "Email",
    detail: "Nhận thông tin qua thư",
    icon: "ticket",
  },
];

export function BookingForm({
  tourPackageId,
  initialName = "",
  initialEmail = "",
  cancelHref,
}: {
  tourPackageId: string;
  initialName?: string;
  initialEmail?: string;
  cancelHref: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [channel, setChannel] = useState<"phone" | "zalo" | "email">("phone");
  const [specialRequest, setSpecialRequest] = useState("");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!confirmed) {
      setError("Vui lòng xác nhận điều kiện dịch vụ trước khi gửi.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourPackageId,
          contact_name: name.trim(),
          contact_phone: phone.trim(),
          contact_email: email.trim(),
          preferred_contact_channel: channel,
          special_request: specialRequest.trim(),
          note: note.trim(),
          confirmation: true,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const firstFieldError = Object.values(
          json?.details?.fieldErrors ?? {},
        ).flat()[0];
        throw new Error(
          typeof firstFieldError === "string"
            ? firstFieldError
            : json?.error ?? "Không gửi được yêu cầu",
        );
      }
      router.push(`/bookings/${json.data.code}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Có lỗi xảy ra",
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      <section>
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-green text-sm font-bold text-white">
            1
          </span>
          <div>
            <h2 className="text-lg font-bold text-brand-ink">Thông tin liên hệ</h2>
            <p className="mt-1 text-sm leading-6 text-brand-muted">
              Thông tin này chỉ được dùng để tư vấn và xác nhận dịch vụ. Bạn chưa cần thanh toán ở
              bước này.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="contact-name" className="text-sm font-bold text-brand-ink">
              Họ và tên <span className="text-status-soldout">*</span>
            </label>
            <Input
              id="contact-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              autoComplete="name"
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="contact-phone" className="text-sm font-bold text-brand-ink">
              Số điện thoại <span className="text-status-soldout">*</span>
            </label>
            <Input
              id="contact-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder="09xx xxx xxx"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="contact-email" className="text-sm font-bold text-brand-ink">
              Email <span className="font-normal text-brand-muted">(không bắt buộc)</span>
            </label>
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="ban@example.com"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-black/5 pt-7">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-green text-sm font-bold text-white">
            2
          </span>
          <div>
            <h2 className="text-lg font-bold text-brand-ink">Cách bạn muốn được liên hệ</h2>
            <p className="mt-1 text-sm leading-6 text-brand-muted">
              Chọn kênh thuận tiện nhất để Sales phản hồi.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {CONTACT_CHANNELS.map((item) => {
            const selected = channel === item.value;
            return (
              <label
                key={item.value}
                className={`cursor-pointer rounded-[18px] border p-4 transition-colors ${
                  selected
                    ? "border-brand-green bg-brand-green-soft"
                    : "border-black/10 bg-white hover:border-brand-green/30"
                }`}
              >
                <input
                  type="radio"
                  name="contact-channel"
                  value={item.value}
                  checked={selected}
                  onChange={() => setChannel(item.value)}
                  className="sr-only"
                />
                <Icon
                  name={item.icon}
                  className={`h-5 w-5 ${
                    selected ? "text-brand-green" : "text-brand-muted"
                  }`}
                />
                <strong className="mt-3 block text-sm text-brand-ink">{item.label}</strong>
                <span className="mt-1 block text-[11px] leading-4 text-brand-muted">
                  {item.detail}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="border-t border-black/5 pt-7">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-green text-sm font-bold text-white">
            3
          </span>
          <div>
            <h2 className="text-lg font-bold text-brand-ink">Yêu cầu cho chuyến đi</h2>
            <p className="mt-1 text-sm leading-6 text-brand-muted">
              Bổ sung những điều Sales cần biết trước khi kiểm tra dịch vụ.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="special-request" className="text-sm font-bold text-brand-ink">
              Yêu cầu đặc biệt
            </label>
            <Textarea
              id="special-request"
              rows={3}
              maxLength={700}
              value={specialRequest}
              onChange={(event) => setSpecialRequest(event.target.value)}
              placeholder="Ví dụ: Có người lớn tuổi, cần phòng tầng thấp, ăn chay…"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="booking-note" className="text-sm font-bold text-brand-ink">
              Ghi chú thêm
            </label>
            <Textarea
              id="booking-note"
              rows={3}
              maxLength={1000}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Thời gian thuận tiện để liên hệ hoặc thông tin khác…"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-black/5 pt-7">
        <label className="flex cursor-pointer items-start gap-3 rounded-[18px] border border-brand-gold/20 bg-brand-gold-soft/[0.45] p-4">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            className="mt-1 h-4 w-4 accent-brand-green"
          />
          <span>
            <strong className="block text-sm text-brand-ink">
              Tôi xác nhận đã xem lại thông tin chuyến đi
            </strong>
            <span className="mt-1 block text-xs leading-5 text-brand-muted">
              Tôi hiểu đây là yêu cầu giữ chỗ/tư vấn, chưa phải xác nhận đặt dịch vụ và chưa phát
              sinh thanh toán. Giá cùng tình trạng chỗ sẽ được Sales kiểm tra lại.
            </span>
          </span>
        </label>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl bg-status-soldout/10 px-4 py-3"
        >
          <AIMascot state="error" size="sm" className="!h-16 !w-16" />
          <p className="text-sm text-status-soldout">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-4 rounded-[18px] border border-brand-green/10 bg-brand-green-soft/[0.45] p-4">
          <AIMascot state="loading" size="sm" />
          <div>
            <p className="font-bold text-brand-ink">Đang tạo mã booking</p>
            <p className="mt-1 text-xs leading-5 text-brand-muted">
              Yêu cầu của bạn đang được lưu để tư vấn viên có thể kiểm tra và phản hồi.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-black/5 pt-6 sm:flex-row sm:justify-end">
        <ButtonLink href={cancelHref} variant="ghost" className="sm:min-w-32">
          Quay lại
        </ButtonLink>
        <Button type="submit" size="lg" disabled={loading || !confirmed} className="sm:min-w-60">
          {loading ? (
            "Đang tạo mã yêu cầu…"
          ) : (
            <>
              Gửi yêu cầu đặt dịch vụ
              <Icon name="arrow-right" className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
