import type { ProductLocation, TravelProduct } from "@/types";
import { Icon } from "@/components/ui/Icon";

export function ItineraryMap({
  locations,
  products,
}: {
  locations: ProductLocation[];
  products: TravelProduct[];
}) {
  const productById = new Map(products.map((product) => [product.id, product]));
  const uniqueLocations = locations.filter(
    (location, index, all) =>
      all.findIndex((item) => item.product_id === location.product_id) === index,
  );
  const focus = uniqueLocations[0];

  if (!focus) {
    return (
      <div className="grid min-h-56 place-items-center rounded-[22px] border border-dashed border-brand-green/20 bg-brand-green-soft/[0.45] p-6 text-center">
        <div>
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-brand-green shadow-card">
            <Icon name="map" className="h-6 w-6" />
          </span>
          <p className="mt-4 font-bold text-brand-ink">Vị trí đang được hoàn thiện</p>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-brand-muted">
            Bản đồ và địa chỉ chi tiết sẽ tự động xuất hiện khi tọa độ của dịch vụ được cập nhật.
          </p>
        </div>
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps?q=${focus.lat},${focus.lng}&z=12&output=embed`;

  return (
    <div className="grid overflow-hidden rounded-[22px] border border-black/5 bg-white lg:grid-cols-[1.35fr_.65fr]">
      <iframe
        title="Bản đồ các điểm trong lịch trình"
        src={mapUrl}
        className="h-72 w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="max-h-72 overflow-y-auto p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold">
          Điểm trong hành trình
        </p>
        <ul className="mt-3 space-y-2">
          {uniqueLocations.map((location, index) => {
            const product = productById.get(location.product_id);
            const href = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
            return (
              <li key={location.id}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-3 rounded-2xl p-2.5 transition-colors hover:bg-brand-green-soft"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-green-soft text-xs font-bold text-brand-green">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <strong className="block truncate text-xs text-brand-ink">
                      {product?.name ?? `Điểm dừng ${index + 1}`}
                    </strong>
                    <span className="mt-0.5 line-clamp-2 block text-[11px] leading-4 text-brand-muted">
                      {location.address ?? `${location.lat}, ${location.lng}`}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
