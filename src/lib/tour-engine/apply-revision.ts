import type { TravelProduct, TripRequest, ProductType } from "@/types";
import { groupKey, type GroupedProducts } from "./filter";
import type { Selection } from "./package-builder";
import { productRelevance } from "./scoring";
import type { Revision } from "@/lib/validation/ai";

function usedIds(sel: Selection): Set<string> {
  const ids = new Set<string>();
  if (sel.transport) ids.add(sel.transport.id);
  if (sel.hotel) ids.add(sel.hotel.id);
  sel.activities.forEach((a) => ids.add(a.id));
  sel.restaurants.forEach((r) => ids.add(r.id));
  return ids;
}

/** Tìm dịch vụ thay thế: ưu tiên khớp tags, tránh avoid_tags, chưa dùng. */
function findAlternative(
  list: TravelProduct[],
  tags: string[],
  avoidTags: string[] | undefined,
  used: Set<string>,
  trip: TripRequest,
): TravelProduct | null {
  const avoid = new Set(avoidTags ?? []);
  const want = new Set(tags);
  const byRel = (a: TravelProduct, b: TravelProduct) =>
    productRelevance(b.tags, b.suitable_for, trip) - productRelevance(a.tags, a.suitable_for, trip);

  const matching = list.filter(
    (p) => !used.has(p.id) && !p.tags.some((t) => avoid.has(t)) && p.tags.some((t) => want.has(t)),
  );
  if (matching.length) return [...matching].sort(byRel)[0];

  const relaxed = list.filter((p) => !used.has(p.id) && !p.tags.some((t) => avoid.has(t)));
  return relaxed.length ? [...relaxed].sort(byRel)[0] : null;
}

/** Áp dụng các thao tác lên Selection hiện tại → Selection mới (backend tính lại giá sau). */
export function applyRevision(
  current: Selection,
  revision: Revision,
  trip: TripRequest,
  grouped: GroupedProducts,
): Selection {
  let transport = current.transport;
  let hotel = current.hotel;
  let activities = [...current.activities];
  let restaurants = [...current.restaurants];

  const snapshot = (): Selection => ({ transport, hotel, activities, restaurants });

  for (const op of revision.operations) {
    if (op.op === "remove") {
      activities = activities.filter((p) => p.id !== op.product_id);
      restaurants = restaurants.filter((p) => p.id !== op.product_id);
      if (transport?.id === op.product_id) transport = null;
      if (hotel?.id === op.product_id) hotel = null;
    } else if (op.op === "add_like") {
      const type: ProductType = op.product_type ?? "activity";
      const cand = findAlternative(grouped[groupKey(type)] ?? [], op.tags, op.avoid_tags, usedIds(snapshot()), trip);
      if (cand) {
        if (type === "restaurant") restaurants.push(cand);
        else if (type === "hotel" || type === "homestay") hotel = cand;
        else if (type === "transport") transport = cand;
        else activities.push(cand);
      }
    } else if (op.op === "replace") {
      const all = [transport, hotel, ...activities, ...restaurants].filter(Boolean) as TravelProduct[];
      const target = all.find((p) => p.id === op.product_id);
      if (target) {
        const cand = findAlternative(grouped[groupKey(target.type)] ?? [], op.tags, undefined, usedIds(snapshot()), trip);
        if (transport?.id === op.product_id) transport = cand ?? transport;
        else if (hotel?.id === op.product_id) hotel = cand ?? hotel;
        else {
          activities = activities.filter((p) => p.id !== op.product_id);
          restaurants = restaurants.filter((p) => p.id !== op.product_id);
          if (cand) (cand.type === "restaurant" ? restaurants : activities).push(cand);
        }
      }
    } else if (op.op === "set_intensity") {
      if (op.level === "lighter") {
        const kept = activities.filter((a) => !a.tags.includes("active"));
        activities = kept.length ? kept : activities.slice(0, 1);
      } else {
        const cand = findAlternative(grouped.activity, ["active"], undefined, usedIds(snapshot()), trip);
        if (cand) activities.push(cand);
      }
    } else if (op.op === "adjust_budget") {
      const sorted = [...grouped.hotel].sort((a, b) =>
        op.direction === "down" ? a.price - b.price : b.price - a.price,
      );
      if (sorted[0]) hotel = sorted[0];
    }
  }

  return { transport, hotel, activities, restaurants };
}
