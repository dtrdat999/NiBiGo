"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TravelStyle } from "@/types";
import {
  BUDGET_PRESETS,
  INTEREST_OPTIONS,
  ROUTES,
  TRAVEL_STYLES,
  TRAVEL_STYLE_LABELS,
} from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { AIMascot } from "@/components/brand/AIMascot";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn, formatVND, formatVNDShort } from "@/lib/utils";

const DRAFT_KEY = "nibigo-planner-draft-v1";

const steps: { title: string; short: string; icon: IconName }[] = [
  { title: "Thông tin chuyến đi", short: "Chuyến đi", icon: "map" },
  { title: "Ngân sách", short: "Ngân sách", icon: "wallet" },
  { title: "Phong cách", short: "Phong cách", icon: "compass" },
  { title: "Sở thích", short: "Sở thích", icon: "heart" },
  { title: "Yêu cầu & xác nhận", short: "Xác nhận", icon: "check" },
];

const styleDescriptions: Record<TravelStyle, string> = {
  relaxing: "Nhịp nhẹ, ưu tiên nghỉ ngơi và trải nghiệm thư giãn.",
  active: "Khám phá nhiều hơn, phù hợp người thích vận động.",
  cultural: "Ưu tiên lịch sử, văn hóa và điểm đến tâm linh.",
  family: "Cân bằng cho gia đình, trẻ nhỏ và thời gian nghỉ.",
};

const quickSpecials = [
  "Có trẻ em",
  "Có người lớn tuổi",
  "Ăn chay",
  "Không leo núi",
  "Lịch trình nhẹ",
  "Cần xe đón từ Hà Nội",
];

type PlannerData = {
  numDays: number;
  startDate: string;
  adults: number;
  children: number;
  elderly: number;
  budget: number;
  style: TravelStyle;
  interests: string[];
  special: string;
};

export interface TripFormInitialValues {
  numDays?: number;
  startDate?: string;
  people?: number;
  budget?: number;
  interest?: string;
  special?: string;
}

function today() {
  const current = new Date();
  const offset = current.getTimezoneOffset() * 60_000;
  return new Date(current.getTime() - offset).toISOString().slice(0, 10);
}

function displayDate(value: string) {
  if (!value) return "Chưa chọn ngày";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function Counter({
  label,
  helper,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  helper: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-black/5 p-4">
      <div>
        <p className="text-sm font-bold text-brand-ink">{label}</p>
        <p className="mt-0.5 text-xs text-brand-muted">{helper}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="grid h-9 w-9 place-items-center rounded-full border border-black/10 text-brand-ink transition hover:bg-brand-cream"
        >
          −
        </button>
        <span className="w-6 text-center font-bold tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(30, value + 1))}
          className="grid h-9 w-9 place-items-center rounded-full border border-black/10 text-brand-ink transition hover:bg-brand-cream"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function TripForm({
  initialValues,
  restoreDraft = true,
}: {
  initialValues?: TripFormInitialValues;
  restoreDraft?: boolean;
}) {
  const router = useRouter();
  const defaultInterests = useMemo(() => {
    const values = ["relaxing", "food", "photo"];
    return initialValues?.interest && !values.includes(initialValues.interest)
      ? [...values, initialValues.interest]
      : values;
  }, [initialValues?.interest]);

  const [step, setStep] = useState(0);
  const [data, setData] = useState<PlannerData>({
    numDays: initialValues?.numDays ?? 3,
    startDate: initialValues?.startDate ?? "",
    adults: initialValues?.people ?? 2,
    children: 0,
    elderly: 0,
    budget: initialValues?.budget ?? 8_000_000,
    style: "relaxing",
    interests: defaultInterests,
    special: initialValues?.special ?? "",
  });
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const people = data.adults + data.children + data.elderly;
  const nights = Math.max(0, data.numDays - 1);

  useEffect(() => {
    if (restoreDraft) {
      try {
        const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null") as
          | { data?: PlannerData; step?: number }
          | null;
        if (draft?.data) setData(draft.data);
        if (typeof draft?.step === "number") setStep(Math.min(4, Math.max(0, draft.step)));
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
    setReady(true);
  }, [restoreDraft]);

  useEffect(() => {
    if (ready && !loading) localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, step }));
  }, [data, step, ready, loading]);

  function update<K extends keyof PlannerData>(key: K, value: PlannerData[K]) {
    setData((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function validate(current: number) {
    if (current === 0) {
      if (!data.startDate) return "Vui lòng chọn ngày khởi hành.";
      if (data.startDate < today()) return "Ngày khởi hành không được ở quá khứ.";
      if (people > 30) return "Tổng số người không được vượt quá 30.";
    }
    if (current === 1 && data.budget < 500_000) {
      return "Ngân sách tối thiểu là 500.000đ.";
    }
    if (current === 3 && data.interests.length === 0) {
      return "Vui lòng chọn ít nhất một sở thích.";
    }
    return null;
  }

  function next() {
    const message = validate(step);
    if (message) return setError(message);
    setStep((value) => Math.min(4, value + 1));
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    const message = validate(4);
    if (message) return setError(message);
    setLoading(true);
    setError(null);

    const response = await fetch("/api/trip-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        num_days: data.numDays,
        start_date: data.startDate,
        adults: data.adults,
        children: data.children,
        elderly: data.elderly,
        budget: data.budget,
        travel_style: data.style,
        interests: data.interests,
        special_requests: data.special || null,
      }),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(json.error ?? "Không thể lưu nhu cầu chuyến đi.");
      setLoading(false);
      return;
    }
    localStorage.removeItem(DRAFT_KEY);
    router.push(ROUTES.proposals(json.data.id));
  }

  if (loading) {
    return (
      <div className="rounded-[28px] border border-black/5 bg-white p-10 text-center shadow-card">
        <AIMascot state="loading" size="lg" className="mx-auto" showStatusText />
        <h2 className="mt-5 text-2xl font-bold text-brand-ink">Đang chuẩn bị hành trình của bạn</h2>
        <p className="mt-2 text-sm text-brand-muted">
          Các lựa chọn sẽ được cân đối theo ngân sách, sở thích và thành phần đoàn bạn vừa cung cấp.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <section className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-card">
        <header className="border-b border-black/5 bg-[#fffdf9] p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.17em] text-brand-gold">
                Bước {step + 1} / 5
              </p>
              <h2 className="mt-1 text-xl font-bold text-brand-ink">{steps[step].title}</h2>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-green-soft text-brand-green">
              <Icon name={steps[step].icon} className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 flex gap-2">
            {steps.map((item, index) => (
              <button
                key={item.title}
                type="button"
                disabled={index > step}
                onClick={() => index < step && setStep(index)}
                className="min-w-0 flex-1"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full",
                    index < step
                      ? "bg-brand-green"
                      : index === step
                        ? "bg-brand-gold"
                        : "bg-black/10",
                  )}
                />
                <span className="mt-1 hidden truncate text-[9px] font-bold text-brand-muted sm:block">
                  {item.short}
                </span>
              </button>
            ))}
          </div>
        </header>

        <div className="min-h-[500px] p-5 sm:p-7">
          {step === 0 && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-brand-green-soft/[0.65] p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-brand-green">
                  <Icon name="map-pin" className="h-4 w-4" /> Ninh Bình
                </p>
                <p className="mt-1 text-xs text-brand-muted">
                  Điểm đến mặc định của MVP, dùng kho dịch vụ đã kiểm soát.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-bold text-brand-ink">Ngày khởi hành *</span>
                  <Input
                    type="date"
                    lang="en-GB"
                    min={today()}
                    value={data.startDate}
                    onChange={(event) => update("startDate", event.target.value)}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-bold text-brand-ink">Thời lượng</span>
                  <select
                    value={data.numDays}
                    onChange={(event) => update("numDays", Number(event.target.value))}
                    className="h-[42px] w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-brand-green"
                  >
                    {Array.from({ length: 14 }, (_, index) => index + 1).map((days) => (
                      <option key={days} value={days}>
                        {days} ngày {Math.max(0, days - 1)} đêm
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="space-y-3">
                <Counter
                  label="Người lớn"
                  helper="Từ 12 tuổi"
                  value={data.adults}
                  min={1}
                  onChange={(value) => update("adults", value)}
                />
                <Counter
                  label="Trẻ em"
                  helper="Dưới 12 tuổi"
                  value={data.children}
                  onChange={(value) => update("children", value)}
                />
                <Counter
                  label="Người lớn tuổi"
                  helper="Cần nhịp đi nhẹ hơn"
                  value={data.elderly}
                  onChange={(value) => update("elderly", value)}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="rounded-[24px] bg-brand-green p-6 text-white">
                <p className="text-xs text-white/60">Ngân sách cho cả đoàn</p>
                <p className="mt-2 text-3xl font-bold">{formatVND(data.budget)}</p>
                <p className="mt-2 text-xs text-white/60">
                  Khoảng {formatVND(Math.round(data.budget / Math.max(1, people)))} mỗi người
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {BUDGET_PRESETS.map((budget) => (
                  <button
                    key={budget}
                    type="button"
                    onClick={() => update("budget", budget)}
                    className={cn(
                      "rounded-2xl border px-3 py-3 text-sm font-bold",
                      data.budget === budget
                        ? "border-brand-green bg-brand-green-soft text-brand-green"
                        : "border-black/10 text-brand-muted",
                    )}
                  >
                    {formatVNDShort(budget)}
                  </button>
                ))}
              </div>
              <label className="space-y-2">
                <span className="text-sm font-bold text-brand-ink">Ngân sách khác</span>
                <Input
                  type="number"
                  min={500000}
                  step={500000}
                  value={data.budget}
                  onChange={(event) => update("budget", Number(event.target.value))}
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {TRAVEL_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => update("style", style)}
                  className={cn(
                    "min-h-40 rounded-[22px] border p-5 text-left transition",
                    data.style === style
                      ? "border-brand-green bg-brand-green-soft"
                      : "border-black/5 hover:bg-brand-cream",
                  )}
                >
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-brand-green">
                    <Icon name={data.style === style ? "check" : "compass"} className="h-5 w-5" />
                  </span>
                  <p className="mt-4 font-bold text-brand-ink">{TRAVEL_STYLE_LABELS[style]}</p>
                  <p className="mt-1 text-xs leading-relaxed text-brand-muted">
                    {styleDescriptions[style]}
                  </p>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {INTEREST_OPTIONS.map((option) => {
                const active = data.interests.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      update(
                        "interests",
                        active
                          ? data.interests.filter((value) => value !== option.value)
                          : [...data.interests, option.value],
                      )
                    }
                    className={cn(
                      "flex items-center justify-between rounded-2xl border px-4 py-4 text-left",
                      active
                        ? "border-brand-green bg-brand-green-soft text-brand-green"
                        : "border-black/5 text-brand-ink",
                    )}
                  >
                    <span className="font-bold">{option.label}</span>
                    <Icon name={active ? "check" : "plus"} className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {quickSpecials.map((option) => {
                  const active = data.special.split("\n").includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        const lines = data.special.split("\n").filter(Boolean);
                        update(
                          "special",
                          active
                            ? lines.filter((line) => line !== option).join("\n")
                            : [...lines, option].join("\n"),
                        );
                      }}
                      className={cn(
                        "rounded-full border px-3 py-2 text-xs font-bold",
                        active
                          ? "border-brand-green bg-brand-green-soft text-brand-green"
                          : "border-black/10 text-brand-muted",
                      )}
                    >
                      {active ? "✓ " : "+ "}
                      {option}
                    </button>
                  );
                })}
              </div>
              <Textarea
                rows={6}
                maxLength={1000}
                value={data.special}
                onChange={(event) => update("special", event.target.value)}
                placeholder="Mô tả thêm điều bạn cần..."
              />
              <div className="rounded-2xl bg-brand-green-soft/[0.55] p-4">
                <p className="flex gap-2 text-xs leading-relaxed text-brand-muted">
                  <Icon name="shield" className="h-4 w-4 shrink-0 text-brand-green" />
                  Tổng chi phí được tính từ từng dịch vụ trong phương án. Tình trạng còn chỗ sẽ
                  được kiểm tra lại trước khi bạn xác nhận.
                </p>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-5 rounded-2xl bg-status-soldout/10 px-4 py-3 text-sm text-status-soldout">
              {error}
            </p>
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-black/5 bg-[#fffdf9] p-4 sm:px-7">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep((value) => Math.max(0, value - 1))}
          >
            ← Quay lại
          </Button>
          {step < 4 ? (
            <Button type="button" onClick={next}>
              Tiếp tục <Icon name="arrow-right" className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={submit}>
              <Icon name="sparkles" className="h-4 w-4" /> Tạo 3 phương án
            </Button>
          )}
        </footer>
      </section>

      <aside className="space-y-4">
        <div className="sticky top-24 rounded-[24px] bg-gradient-to-br from-[#2f7d5c] via-brand-green to-brand-green-dark p-5 text-white shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">
            Tóm tắt chuyến đi
          </p>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-wide text-white/[0.65]">Điểm đến</dt>
              <dd className="mt-1 font-bold">Ninh Bình</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wide text-white/[0.65]">Thời gian</dt>
              <dd className="mt-1 font-bold">
                {displayDate(data.startDate)} · {data.numDays}N{nights}Đ
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wide text-white/[0.65]">Đoàn</dt>
              <dd className="mt-1 font-bold">{people} người</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wide text-white/[0.65]">Ngân sách</dt>
              <dd className="mt-1 font-bold">{formatVND(data.budget)}</dd>
            </div>
          </dl>
          <p className="mt-5 border-t border-white/20 pt-4 text-xs leading-relaxed text-white/70">
            Bản nháp được lưu tự động trên thiết bị này.
          </p>
        </div>
      </aside>
    </div>
  );
}
