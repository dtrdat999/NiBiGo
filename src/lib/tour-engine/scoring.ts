import type { TripRequest, GroupComposition } from "@/types";
import { FIT_SCORE_WEIGHTS } from "@/lib/constants";
import type { PricedItem } from "./types";

const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Độ khớp sở thích: tags sản phẩm ∩ interests khách. */
export function interestMatch(tags: string[], interests: string[]): number {
  if (!interests.length) return 0.5;
  const set = new Set(interests);
  const overlap = tags.filter((t) => set.has(t)).length;
  return clamp(overlap / Math.min(interests.length, 3));
}

/** Độ phù hợp nhóm khách. */
export function groupMatch(
  suitableFor: string[],
  tags: string[],
  g: GroupComposition,
): number {
  const adults = g?.adults ?? 0;
  const children = g?.children ?? 0;
  const elderly = g?.elderly ?? 0;
  const total = adults + children + elderly;
  const isCouple = adults === 2 && children === 0 && elderly === 0;
  const isSolo = total === 1;
  const sf = new Set(suitableFor);

  let score = 0.5;
  if (isCouple && sf.has("couple")) score += 0.4;
  if (isSolo && sf.has("solo")) score += 0.3;
  if (children > 0 && (sf.has("family") || sf.has("kids"))) score += 0.4;
  if (elderly > 0 && sf.has("elderly")) score += 0.3;
  if (elderly > 0 && tags.includes("active")) score -= 0.3;
  if (!isCouple && !isSolo && children === 0 && sf.has("family")) score += 0.2;
  return clamp(score);
}

/** Độ khớp ngân sách (AI_DESIGN §3.1). */
export function budgetMatch(total: number, budget: number): number {
  if (budget <= 0) return 0.5;
  const ratio = total / budget;
  if (ratio > 1) return clamp(1 - (ratio - 1) * 2);
  if (ratio >= 0.85) return 1;
  if (ratio >= 0.7) return 0.8;
  return 0.6;
}

/** Độ vừa sức của lịch (giờ hoạt động/ngày vs lý tưởng theo phong cách). */
export function durationMatch(
  activityItems: PricedItem[],
  numDays: number,
  style: string | null,
): number {
  const totalHours = activityItems.reduce(
    (s, it) => s + (it.product.duration_hours ?? 0),
    0,
  );
  const perDay = numDays > 0 ? totalHours / numDays : totalHours;
  const ideal = style === "active" ? 8 : style === "relaxing" ? 5 : 6.5;
  return clamp(1 - Math.abs(perDay - ideal) / ideal);
}

/** Chất lượng trung bình (1–5 → 0–1). */
export function qualityPriority(items: PricedItem[]): number {
  if (!items.length) return 0.5;
  return clamp(avg(items.map((it) => it.product.quality_score)) / 5);
}

/** Fit score tổng của gói (0–100), trọng số 30/25/20/15/10. */
export function packageFitScore(
  items: PricedItem[],
  trip: TripRequest,
  total: number,
): number {
  const allTags = [...new Set(items.flatMap((it) => it.product.tags))];
  const im = interestMatch(allTags, trip.interests);
  const gm = avg(items.map((it) => groupMatch(it.product.suitable_for, it.product.tags, trip.group_composition)));
  const bm = budgetMatch(total, trip.budget);
  const dm = durationMatch(
    items.filter((it) => it.product.type === "activity"),
    trip.num_days,
    trip.travel_style,
  );
  const qp = qualityPriority(items);

  const score =
    FIT_SCORE_WEIGHTS.budget * bm +
    FIT_SCORE_WEIGHTS.interest * im +
    FIT_SCORE_WEIGHTS.group * gm +
    FIT_SCORE_WEIGHTS.duration * dm +
    FIT_SCORE_WEIGHTS.quality * qp;

  return Math.round(clamp(score, 0, 100));
}

/** Độ liên quan của 1 sản phẩm với nhu cầu (để chọn vào gói). */
export function productRelevance(
  tags: string[],
  suitableFor: string[],
  trip: TripRequest,
): number {
  return (
    interestMatch(tags, trip.interests) * 0.55 +
    groupMatch(suitableFor, tags, trip.group_composition) * 0.45
  );
}
