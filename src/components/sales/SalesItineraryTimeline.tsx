import Link from "next/link";
import { Badge, availabilityTone } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import {
  AVAILABILITY_LABELS,
  PRODUCT_TYPE_LABELS,
  ROUTES,
} from "@/lib/constants";
import {
  isSystemItinerarySlot,
  ITINERARY_SLOT_LABELS,
  ITINERARY_SLOT_TIMES,
} from "@/lib/itinerary/structure";
import type {
  ItineraryDay,
  ProductLocation,
  ProductType,
  TravelProduct,
} from "@/types";

const PRODUCT_ICON: Record<ProductType, IconName> = {
  hotel: "building",
  homestay: "home",
  activity: "ticket",
  restaurant: "utensils",
  transport: "car",
  combo: "sparkles",
};

export function SalesItineraryTimeline({
  itinerary,
  products,
  locations,
}: {
  itinerary: ItineraryDay[];
  products: TravelProduct[];
  locations: ProductLocation[];
}) {
  const productById = new Map(products.map((product) => [product.id, product]));
  const locationByProduct = new Map(
    locations.map((location) => [location.product_id, location]),
  );

  if (itinerary.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 bg-brand-cream/[0.45] p-5 text-sm leading-6 text-brand-muted">
        Gói hiện tại chưa có dữ liệu lịch trình theo ngày.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {itinerary.map((day) => (
        <article
          key={day.day}
          className="overflow-hidden rounded-[22px] border border-black/[0.06] bg-white"
        >
          <header className="flex flex-col gap-3 border-b border-black/5 bg-brand-green-soft/[0.55] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-green text-sm font-bold text-white">
                {String(day.day).padStart(2, "0")}
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold">
                  Ngày {day.day}
                </p>
                <h3 className="mt-0.5 text-lg font-bold text-brand-ink">{day.title}</h3>
              </div>
            </div>
            <span className="w-fit rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-muted">
              {day.slots.length} mốc trong ngày
            </span>
          </header>

          <ol className="divide-y divide-black/5 px-5">
            {day.slots.map((slot, index) => {
              const isSystemSlot = isSystemItinerarySlot(slot);
              const product = isSystemSlot ? undefined : productById.get(slot.product_id);
              const location = isSystemSlot ? undefined : locationByProduct.get(slot.product_id);
              const icon = product ? PRODUCT_ICON[product.type] : "clock";

              return (
                <li
                  key={`${day.day}-${slot.time}-${slot.product_id}-${index}`}
                  className="grid gap-3 py-5 sm:grid-cols-[92px_minmax(0,1fr)]"
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-brand-gold">
                      {ITINERARY_SLOT_LABELS[slot.time]}
                    </p>
                    <p className="mt-0.5 text-sm font-bold tabular-nums text-brand-ink">
                      {ITINERARY_SLOT_TIMES[slot.time]}
                    </p>
                  </div>

                  <div className="rounded-[18px] border border-black/5 bg-[#fffdf9] p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-green-soft text-brand-green">
                        <Icon name={icon} className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
                              {product
                                ? PRODUCT_TYPE_LABELS[product.type]
                                : "Khoảng nghỉ / tự do"}
                            </p>
                            <h4 className="mt-1 text-base font-bold leading-snug text-brand-ink">
                              {product?.name ?? ITINERARY_SLOT_LABELS[slot.time]}
                            </h4>
                          </div>
                          {product && (
                            <Badge tone={availabilityTone[product.availability_status]}>
                              {AVAILABILITY_LABELS[product.availability_status]}
                            </Badge>
                          )}
                        </div>

                        <p className="mt-2 text-sm leading-6 text-brand-muted">
                          {slot.description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-brand-muted">
                          {product?.duration_hours && (
                            <span className="inline-flex items-center gap-1.5">
                              <Icon name="clock" className="h-3.5 w-3.5 text-brand-green" />
                              Khoảng {product.duration_hours} giờ
                            </span>
                          )}
                          {location?.address && (
                            <span className="inline-flex items-center gap-1.5">
                              <Icon
                                name="map-pin"
                                className="h-3.5 w-3.5 text-brand-green"
                              />
                              {location.address}
                            </span>
                          )}
                        </div>

                        {product && (
                          <div className="mt-4 border-t border-black/5 pt-3">
                            <Link
                              href={ROUTES.product(product.id)}
                              className="text-xs font-bold text-brand-green hover:underline"
                            >
                              Xem dữ liệu dịch vụ
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </article>
      ))}
    </div>
  );
}
