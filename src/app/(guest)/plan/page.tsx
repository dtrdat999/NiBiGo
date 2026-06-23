import type { Metadata } from "next";
import { TripForm } from "@/components/guest/TripForm";

export const metadata: Metadata = { title: "Lập kế hoạch — NiBiGo AI Travel Platform" };

export default function PlanPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Lập kế hoạch chuyến đi</h1>
        <p className="mt-1 text-brand-muted">
          Cho chúng tôi biết nhu cầu — AI sẽ tạo 3 gói tour Ninh Bình phù hợp ngân sách và sở thích.
        </p>
      </div>
      <TripForm />
    </div>
  );
}
