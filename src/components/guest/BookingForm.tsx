"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export function BookingForm({
  tourPackageId,
  onCancel,
}: {
  tourPackageId: string;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourPackageId,
          contact_name: name,
          contact_phone: phone,
          contact_email: email,
          note,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Không gửi được yêu cầu");
      router.push(`/bookings/${json.data.code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-brand-muted">
        Đây là yêu cầu đặt tour (chưa thanh toán). Đội ngũ NiBiGo sẽ liên hệ xác nhận dịch vụ và chi phí.
      </p>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-brand-ink">Họ và tên *</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nguyễn Văn A" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-brand-ink">Số điện thoại *</label>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          inputMode="tel"
          placeholder="09xxxxxxxx"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-brand-ink">Email (tùy chọn)</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@example.com" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-brand-ink">Ghi chú (tùy chọn)</label>
        <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Mong muốn thêm…" />
      </div>

      {error && (
        <p className="rounded-lg bg-status-soldout/10 px-3 py-2 text-sm text-status-soldout">{error}</p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Đang gửi…" : "Gửi yêu cầu đặt tour"}
        </Button>
      </div>
    </form>
  );
}
