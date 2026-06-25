import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge, availabilityTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ProductDetailActions } from "@/components/guest/ProductDetailActions";
import {
  AVAILABILITY_LABELS,
  PRICE_UNIT_LABELS,
  PRODUCT_TYPE_LABELS,
  ROUTES,
  SUITABLE_FOR_LABELS,
} from "@/lib/constants";
import { formatVND } from "@/lib/utils";
import type {
  ProductLocation,
  ProductType,
  TravelProduct,
} from "@/types";

export const dynamic = "force-dynamic";

type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  sort_order: number;
};

type DetailProduct = TravelProduct & {
  created_at?: string;
  updated_at?: string;
};

const productGradient: Record<ProductType, string> = {
  hotel: "from-[#718477] to-[#293f35]",
  homestay: "from-[#9c7e5b] to-[#513e2b]",
  activity: "from-[#477e68] to-[#184a38]",
  restaurant: "from-[#aa694d] to-[#633722]",
  transport: "from-[#627c91] to-[#2d4255]",
  combo: "from-[#77618f] to-[#403356]",
};

function typeIcon(type: ProductType): IconName {
  if (type === "activity") return "ticket";
  if (type === "restaurant") return "utensils";
  if (type === "transport") return "car";
  if (type === "combo") return "sparkles";
  if (type === "homestay") return "home";
  return "building";
}

function inferArea(product: DetailProduct) {
  const text = `${product.name} ${product.description ?? ""}`.toLocaleLowerCase("vi-VN");
  if (text.includes("tràng an")) return "Tràng An";
  if (text.includes("tam cốc") || text.includes("tam coc")) return "Tam Cốc";
  if (text.includes("hang múa")) return "Hang Múa";
  if (text.includes("bái đính")) return "Bái Đính";
  if (text.includes("cúc phương")) return "Cúc Phương";
  if (text.includes("hoa lư")) return "Hoa Lư";
  if (text.includes("vân long")) return "Vân Long";
  return "Ninh Bình";
}

function displaySuitable(value: string) {
  return SUITABLE_FOR_LABELS[value as keyof typeof SUITABLE_FOR_LABELS] ?? value;
}

function GalleryVisual({
  product,
  image,
  className,
}: {
  product: DetailProduct;
  image?: { url: string; alt: string | null } | null;
  className: string;
}) {
  const url = image?.url ?? product.image_url;
  const background = url
    ? {
        backgroundImage: `linear-gradient(to top, rgba(12,32,24,.58), rgba(12,32,24,.02)), url("${url}")`,
      }
    : undefined;

  return (
    <div
      role="img"
      aria-label={image?.alt ?? product.name}
      style={background}
      className={`relative overflow-hidden bg-cover bg-center ${className} ${
        url ? "" : `bg-gradient-to-br ${productGradient[product.type]}`
      }`}
    >
      {!url && (
        <>
          <span className="absolute -right-12 -top-14 h-52 w-52 rounded-full border-[36px] border-white/[0.06]" />
          <Icon
            name={typeIcon(product.type)}
            className="absolute bottom-7 right-7 h-24 w-24 text-white/[0.13]"
          />
        </>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-white/60">
          {PRODUCT_TYPE_LABELS[product.type]} · {inferArea(product)}
        </p>
      </div>
    </div>
  );
}

function RelatedProductCard({ product }: { product: DetailProduct }) {
  const background = product.image_url
    ? {
        backgroundImage: `linear-gradient(to top, rgba(12,32,24,.72), rgba(12,32,24,.03)), url("${product.image_url}")`,
      }
    : undefined;

  return (
    <Link
      href={ROUTES.product(product.id)}
      className="group overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div
        style={background}
        className={`relative h-36 bg-cover bg-center ${
          product.image_url ? "" : `bg-gradient-to-br ${productGradient[product.type]}`
        }`}
      >
        {!product.image_url && (
          <Icon
            name={typeIcon(product.type)}
            className="absolute bottom-4 right-4 h-14 w-14 text-white/[0.14]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/[0.58] via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <Badge tone={availabilityTone[product.availability_status]}>
            {AVAILABILITY_LABELS[product.availability_status]}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <p className="line-clamp-2 min-h-11 font-bold leading-snug text-brand-ink transition group-hover:text-brand-green">
          {product.name}
        </p>
        <p className="mt-2 text-sm font-bold text-brand-green">
          {formatVND(product.price)}
          <span className="ml-1 text-[10px] font-medium text-brand-muted">
            {PRICE_UNIT_LABELS[product.price_unit]}
          </span>
        </p>
      </div>
    </Link>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("name, description")
    .eq("id", params.id)
    .maybeSingle();

  if (!data) return { title: "Dịch vụ không tồn tại — NiBiGo" };
  return {
    title: `${data.name} — NiBiGo`,
    description: data.description ?? `Chi tiết dịch vụ ${data.name} tại Ninh Bình.`,
  };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: productData } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .eq("is_active", true)
    .eq("status", "published")
    .maybeSingle();

  if (!productData) notFound();
  const product = productData as DetailProduct;

  const [
    { data: imagesData },
    { data: locationData },
    { data: savedData },
    { data: cartData },
    { data: relatedData },
  ] = await Promise.all([
    supabase
      .from("product_images")
      .select("id, url, alt, sort_order")
      .eq("product_id", product.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("product_locations")
      .select("id, product_id, lat, lng, address")
      .eq("product_id", product.id)
      .maybeSingle(),
    user
      ? supabase
          .from("saved_products")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", product.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from("cart_items")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", product.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("status", "published")
      .neq("id", product.id)
      .limit(8),
  ]);

  const images = (imagesData as ProductImage[] | null) ?? [];
  const location = (locationData as ProductLocation | null) ?? null;
  const relatedCandidates = (relatedData as DetailProduct[] | null) ?? [];
  const related = relatedCandidates
    .sort((a, b) => {
      const aScore =
        (a.type === product.type ? 3 : 0) +
        a.tags.filter((tag) => product.tags.includes(tag)).length;
      const bScore =
        (b.type === product.type ? 3 : 0) +
        b.tags.filter((tag) => product.tags.includes(tag)).length;
      return bScore - aScore || b.quality_score - a.quality_score;
    })
    .slice(0, 4);

  const galleryImages = images.length > 0 ? images : [{ id: "cover", url: product.image_url ?? "", alt: product.name, sort_order: 0 }];
  const area = location?.address ?? `${inferArea(product)}, Ninh Bình`;
  const mapHref = location
    ? `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`
    : null;
  const isSaved = Boolean(savedData);
  const isAdded = Boolean(cartData);
  const availabilityWarning =
    product.availability_status === "sold_out"
      ? "Dịch vụ đang tạm hết chỗ và không thể thêm vào danh sách đã chọn."
      : product.availability_status === "limited"
        ? "Dịch vụ còn ít chỗ. Sales sẽ kiểm tra lại trước khi xác nhận."
        : product.availability_status === "need_confirmation"
          ? "Tình trạng dịch vụ cần được Sales xác nhận thủ công."
          : "Trạng thái hiện tại là còn chỗ, nhưng vẫn cần xác nhận ở bước booking.";

  return (
    <div className="space-y-10">
      <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-muted">
        <Link href={ROUTES.explore} className="hover:text-brand-green">
          Khám phá
        </Link>
        <Icon name="chevron-right" className="h-3.5 w-3.5" />
        <Link
          href={`${ROUTES.products}?category=${product.type}`}
          className="hover:text-brand-green"
        >
          {PRODUCT_TYPE_LABELS[product.type]}
        </Link>
        <Icon name="chevron-right" className="h-3.5 w-3.5" />
        <span className="max-w-52 truncate text-brand-ink">{product.name}</span>
      </nav>

      <section className="grid gap-3 overflow-hidden rounded-[30px] lg:grid-cols-[1.45fr_.55fr] lg:grid-rows-2">
        <GalleryVisual
          product={product}
          image={galleryImages[0]}
          className="min-h-[360px] rounded-[28px] lg:row-span-2 lg:min-h-[560px]"
        />
        <GalleryVisual
          product={product}
          image={galleryImages[1] ?? null}
          className="hidden min-h-[270px] rounded-[28px] lg:block"
        />
        <GalleryVisual
          product={product}
          image={galleryImages[2] ?? null}
          className="hidden min-h-[270px] rounded-[28px] lg:block"
        />
      </section>

      <section className="grid gap-7 lg:grid-cols-[1fr_360px]">
        <div className="space-y-7">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={availabilityTone[product.availability_status]}>
                {AVAILABILITY_LABELS[product.availability_status]}
              </Badge>
              <span className="rounded-full bg-brand-gold-soft px-3 py-1 text-xs font-bold text-[#9f6818]">
                {PRODUCT_TYPE_LABELS[product.type]}
              </span>
              {product.quality_score >= 5 && (
                <span className="rounded-full bg-brand-green-soft px-3 py-1 text-xs font-bold text-brand-green">
                  Được yêu thích
                </span>
              )}
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-brand-ink sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-muted">
              <Icon name="map-pin" className="h-5 w-5 text-brand-green" />
              {area}
            </p>
          </div>

          <Card>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
              Tổng quan dịch vụ
            </p>
            <p className="mt-4 text-base leading-8 text-brand-muted">
              {product.description ?? "Dịch vụ du lịch được NiBiGo chọn lọc tại Ninh Bình."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`${ROUTES.products}?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-brand-cream px-3 py-1.5 text-xs font-semibold text-brand-muted transition hover:bg-brand-green-soft hover:text-brand-green"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-green-soft text-brand-green">
                <Icon name="clock" className="h-5 w-5" />
              </span>
              <p className="mt-4 text-xs font-semibold text-brand-muted">Thời lượng</p>
              <p className="mt-1 font-bold text-brand-ink">
                {product.duration_hours ? `${product.duration_hours} giờ` : "Theo dịch vụ"}
              </p>
            </Card>
            <Card className="p-5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-gold-soft text-[#9f6818]">
                <Icon name="users" className="h-5 w-5" />
              </span>
              <p className="mt-4 text-xs font-semibold text-brand-muted">Phù hợp</p>
              <p className="mt-1 line-clamp-2 font-bold text-brand-ink">
                {product.suitable_for.length > 0
                  ? product.suitable_for.map(displaySuitable).join(", ")
                  : "Nhiều nhóm khách"}
              </p>
            </Card>
            <Card className="p-5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e8edf4] text-[#365d80]">
                <Icon name="shield" className="h-5 w-5" />
              </span>
              <p className="mt-4 text-xs font-semibold text-brand-muted">Xác nhận</p>
              <p className="mt-1 font-bold text-brand-ink">Qua tư vấn viên</p>
            </Card>
          </div>

          <Card>
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-gold-soft text-[#9f6818]">
                <Icon name="shield" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-brand-ink">Phạm vi giá và điều kiện xác nhận</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-brand-green-soft/65 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-green">
                      Dữ liệu đã có
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-brand-muted">
                      <li className="flex gap-2">
                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                        Giá cơ sở: {formatVND(product.price)} {PRICE_UNIT_LABELS[product.price_unit]}.
                      </li>
                      <li className="flex gap-2">
                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                        Tình trạng hiện tại: {AVAILABILITY_LABELS[product.availability_status]}.
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-2xl bg-brand-cream p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-muted">
                      Cần Sales xác nhận
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-brand-muted">
                      <li>Chi tiết bao gồm/không bao gồm chưa có trường dữ liệu riêng.</li>
                      <li>Chi phí phát sinh, chính sách đổi/hủy và khả năng phục vụ theo ngày đi.</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-brand-muted">
                  {availabilityWarning}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                  Vị trí dịch vụ
                </p>
                <h2 className="mt-1 text-lg font-bold text-brand-ink">{area}</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-brand-muted">
                  {location
                    ? "Tọa độ đã được lưu trong hệ thống. Bạn có thể mở vị trí trên Google Maps để tham khảo."
                    : "Địa chỉ cụ thể sẽ được kiểm tra và gửi lại khi tư vấn viên xử lý yêu cầu."}
                </p>
              </div>
              {mapHref ? (
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-brand-green/20 px-5 py-2.5 text-sm font-bold text-brand-green transition hover:bg-brand-green-soft"
                >
                  <Icon name="map-pin" className="h-4 w-4" />
                  Mở Google Maps
                </a>
              ) : (
                <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-cream px-4 py-2 text-xs font-semibold text-brand-muted">
                  <Icon name="map-pin" className="h-4 w-4" />
                  Chờ cập nhật tọa độ
                </span>
              )}
            </div>
          </Card>
        </div>

        <aside>
          <div className="sticky top-24 space-y-4">
            <Card className="p-5">
              <p className="text-xs font-semibold text-brand-muted">Giá tham khảo từ</p>
              <p className="mt-2 text-3xl font-bold text-brand-green">{formatVND(product.price)}</p>
              <p className="mt-1 text-sm font-medium text-brand-muted">
                {PRICE_UNIT_LABELS[product.price_unit]}
              </p>
              <div className="my-5 h-px bg-black/5" />
              <ProductDetailActions
                productId={product.id}
                productName={product.name}
                firstTag={product.tags[0] ?? "nature"}
                availability={product.availability_status}
                initialSaved={isSaved}
                initialAdded={isAdded}
              />
              <div className="mt-2 rounded-2xl bg-brand-cream p-3">
                <p className="flex gap-2 text-xs leading-relaxed text-brand-muted">
                  <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                  Thêm dịch vụ chưa tạo đặt chỗ. Bạn có thể hoàn thiện lịch trình rồi gửi yêu cầu
                  để được kiểm tra tình trạng còn chỗ.
                </p>
              </div>
            </Card>

            <Card className="bg-brand-ink p-5 text-white">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-brand-gold">
                  <Icon name="sparkles" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold">AI có thể giúp bạn cân nhắc gì?</p>
                  <ul className="mt-3 space-y-2 text-xs leading-relaxed text-white/65">
                    <li>• Đưa dịch vụ này vào lịch trình phù hợp.</li>
                    <li>• So sánh với lựa chọn cùng loại.</li>
                    <li>• Tính lại tổng chi phí sau khi thay đổi.</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </aside>
      </section>

      {related.length > 0 && (
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                Gợi ý liên quan
              </p>
              <h2 className="mt-1 text-2xl font-bold text-brand-ink">
                Có thể phù hợp với hành trình của bạn
              </h2>
            </div>
            <Link
              href={`${ROUTES.products}?category=${product.type}`}
              className="hidden items-center gap-1 text-sm font-bold text-brand-green sm:inline-flex"
            >
              Xem cùng danh mục
              <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <RelatedProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
