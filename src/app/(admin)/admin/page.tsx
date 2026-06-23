import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Admin — NiBiGo AI Travel Platform" };
export const dynamic = "force-dynamic";

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Tổng quan</h1>
        <p className="mt-1 text-brand-muted">Bảng điều khiển cho Admin/Sales.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Booking request", value: "—" },
          { label: "Đang chờ xử lý", value: "—" },
          { label: "Đã xác nhận", value: "—" },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-brand-muted">{s.label}</p>
            <p className="mt-2 text-2xl font-bold text-brand-green">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-base font-bold text-brand-ink">Danh sách booking &amp; quản lý dịch vụ</h2>
        <p className="mt-2 text-sm text-brand-muted">
          Sẽ hoàn thiện ở Phase 3 (quản lý dịch vụ) và Phase 8 (dashboard booking).
        </p>
      </Card>
    </div>
  );
}
