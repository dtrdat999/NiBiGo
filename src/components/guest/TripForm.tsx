"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TravelStyle } from "@/types";
import {
  TRAVEL_STYLES,
  TRAVEL_STYLE_LABELS,
  INTEREST_OPTIONS,
  BUDGET_PRESETS,
} from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn, formatVND, formatVNDShort } from "@/lib/utils";

function Stepper({
  label,
  value,
  set,
  min = 0,
  max = 30,
}: {
  label: string;
  value: number;
  set: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-brand-ink">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => set(Math.max(min, value - 1))}
          className="grid h-8 w-8 place-items-center rounded-full border border-black/10 text-lg text-brand-ink hover:bg-black/5"
          aria-label={`Giảm ${label}`}
        >
          −
        </button>
        <span className="w-6 text-center font-semibold tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => set(Math.min(max, value + 1))}
          className="grid h-8 w-8 place-items-center rounded-full border border-black/10 text-lg text-brand-ink hover:bg-black/5"
          aria-label={`Tăng ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function TripForm() {
  const router = useRouter();

  // Default theo kịch bản demo: cặp đôi, 3N2Đ, ~8tr, nghỉ dưỡng nhẹ.
  const [numDays, setNumDays] = useState(3);
  const [startDate, setStartDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [elderly, setElderly] = useState(0);
  const [budget, setBudget] = useState(8_000_000);
  const [style, setStyle] = useState<TravelStyle>("relaxing");
  const [interests, setInterests] = useState<string[]>(["relaxing", "food", "photo"]);
  const [special, setSpecial] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const numPeople = adults + children + elderly;
  const numNights = Math.max(0, numDays - 1);

  function toggleInterest(v: string) {
    setInterests((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/trip-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        num_days: numDays,
        start_date: startDate || null,
        adults,
        children,
        elderly,
        budget,
        travel_style: style,
        interests,
        special_requests: special || null,
      }),
    });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(json?.error ?? "Không tạo được yêu cầu. Thử lại.");
      setLoading(false);
      return;
    }
    router.push(`/proposals/${json.data.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Điểm đến */}
      <Card>
        <div className="flex items-center gap-3">
          <span className="text-2xl">📍</span>
          <div>
            <p className="text-sm text-brand-muted">Điểm đến</p>
            <p className="font-bold text-brand-ink">Ninh Bình</p>
          </div>
        </div>
      </Card>

      {/* Thời gian */}
      <Card className="space-y-4">
        <h2 className="font-bold text-brand-ink">Thời gian</h2>
        <Stepper label="Số ngày" value={numDays} set={setNumDays} min={1} max={14} />
        <p className="text-sm text-brand-muted">
          → {numDays} ngày {numNights} đêm
        </p>
        <div className="space-y-1.5">
          <label className="text-sm text-brand-ink">Ngày khởi hành (tùy chọn)</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
      </Card>

      {/* Đoàn */}
      <Card className="space-y-3">
        <h2 className="font-bold text-brand-ink">Thành phần đoàn</h2>
        <Stepper label="Người lớn" value={adults} set={setAdults} min={1} max={30} />
        <Stepper label="Trẻ em" value={children} set={setChildren} min={0} max={20} />
        <Stepper label="Người lớn tuổi" value={elderly} set={setElderly} min={0} max={20} />
        <p className="border-t border-black/5 pt-3 text-sm text-brand-muted">
          Tổng: <span className="font-semibold text-brand-ink">{numPeople} người</span>
        </p>
      </Card>

      {/* Ngân sách */}
      <Card className="space-y-3">
        <h2 className="font-bold text-brand-ink">Ngân sách dự kiến</h2>
        <div className="flex flex-wrap gap-2">
          {BUDGET_PRESETS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBudget(b)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                budget === b ? "bg-brand-green text-white" : "bg-black/5 text-brand-muted hover:bg-black/10",
              )}
            >
              {formatVNDShort(b)}
            </button>
          ))}
        </div>
        <Input
          type="number"
          min={500000}
          step={500000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
        />
        <p className="text-sm text-brand-muted">{formatVND(budget)} cho cả đoàn</p>
      </Card>

      {/* Phong cách */}
      <Card className="space-y-3">
        <h2 className="font-bold text-brand-ink">Phong cách du lịch</h2>
        <div className="grid grid-cols-2 gap-2">
          {TRAVEL_STYLES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStyle(s)}
              className={cn(
                "rounded-xl border p-3 text-left text-sm font-medium transition-colors",
                style === s
                  ? "border-brand-green bg-brand-green-soft text-brand-green"
                  : "border-black/10 text-brand-ink hover:bg-black/5",
              )}
            >
              {TRAVEL_STYLE_LABELS[s]}
            </button>
          ))}
        </div>
      </Card>

      {/* Sở thích */}
      <Card className="space-y-3">
        <h2 className="font-bold text-brand-ink">Sở thích</h2>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((opt) => {
            const active = interests.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleInterest(opt.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-brand-green bg-brand-green-soft text-brand-green"
                    : "border-black/10 text-brand-muted hover:bg-black/5",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Yêu cầu đặc biệt */}
      <Card className="space-y-3">
        <h2 className="font-bold text-brand-ink">Yêu cầu đặc biệt</h2>
        <Textarea
          rows={3}
          value={special}
          onChange={(e) => setSpecial(e.target.value)}
          placeholder="VD: Có xe đón từ Hà Nội, lịch đừng quá mệt…"
        />
      </Card>

      {error && (
        <p className="rounded-lg bg-status-soldout/10 px-3 py-2 text-sm text-status-soldout">{error}</p>
      )}

      <Button type="submit" size="lg" disabled={loading} className="w-full">
        {loading ? "Đang tạo yêu cầu…" : "Tạo gợi ý tour"}
      </Button>
    </form>
  );
}
