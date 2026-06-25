import type { Metadata } from "next";
import { TripForm, type TripFormInitialValues } from "@/components/guest/TripForm";

export const metadata: Metadata = { title: "Lập kế hoạch — NiBiGo AI Travel Platform" };

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function numberInRange(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

export default function PlanPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const hasPrefill = Boolean(
    searchParams &&
      Object.values(searchParams).some((value) =>
        Array.isArray(value) ? value.length > 0 : Boolean(value),
      ),
  );
  const initialValues: TripFormInitialValues = {
    numDays: numberInRange(single(searchParams?.days), 3, 1, 14),
    people: numberInRange(single(searchParams?.people), 2, 1, 30),
    budget: numberInRange(single(searchParams?.budget), 8_000_000, 500_000, 100_000_000),
    startDate: single(searchParams?.start_date) ?? "",
    interest: single(searchParams?.interest),
    special: single(searchParams?.special),
  };

  return (
    <div className="space-y-7">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
          NiBi AI Planner
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-ink sm:text-4xl">
          Cùng bạn tạo nên hành trình đáng nhớ.
        </h1>
        <p className="mt-3 text-sm leading-7 text-brand-muted sm:text-base">
          Chỉ 3–5 phút để nhận ba phương án — rõ lịch trình, rõ chi phí, rõ điều kiện cần xác nhận.
        </p>
      </div>
      <TripForm initialValues={initialValues} restoreDraft={!hasPrefill} />
    </div>
  );
}
