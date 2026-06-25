import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge, availabilityTone } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ExploreProductActions } from "@/components/guest/ExploreProductActions";
import {
  AVAILABILITY_LABELS,
  PRICE_UNIT_LABELS,
  PRODUCT_TYPE_LABELS,
  ROUTES,
} from "@/lib/constants";
import { formatVND } from "@/lib/utils";
import type { ProductType, TravelProduct } from "@/types";

export const metadata: Metadata = {
  title: "Khám phá dịch vụ Ninh Bình — NiBiGo",
  description:
    "Tour, lưu trú, ẩm thực và trải nghiệm Ninh Bình với giá và tình trạng được hiển thị rõ ràng.",
};
export const dynamic = "force-dynamic";

type ExploreProduct = Pick<
  TravelProduct,
  | "id"
  | "name"
  | "type"
  | "description"
  | "price"
  | "price_unit"
  | "duration_hours"
  | "tags"
  | "suitable_for"
  | "availability_status"
  | "quality_score"
  | "image_url"
>;

const categoryItems: {
  value: ProductType;
  title: string;
  shortTitle: string;
  description: string;
  icon: IconName;
  tone: string;
}[] = [
    {
      value: "activity",
      title: "Tour & trải nghiệm",
      shortTitle: "Trải nghiệm",
      description: "Đi thuyền, tham quan, văn hóa và hoạt động địa phương.",
      icon: "ticket",
      tone: "bg-[#e8f1eb] text-brand-green",
    },
    {
      value: "hotel",
      title: "Khách sạn & resort",
      shortTitle: "Khách sạn",
      description: "Lưu trú từ gần gũi đến nghỉ dưỡng cao cấp.",
      icon: "building",
      tone: "bg-[#f7ead7] text-[#9b611d]",
    },
    {
      value: "homestay",
      title: "Homestay",
      shortTitle: "Homestay",
      description: "Gần thiên nhiên, giữa ruộng đồng, đậm chất bản địa.",
      icon: "home",
      tone: "bg-[#eee7dc] text-[#795d38]",
    },
    {
      value: "transport",
      title: "Di chuyển",
      shortTitle: "Di chuyển",
      description: "Xe ghép, limousine và xe riêng cho từng nhóm.",
      icon: "car",
      tone: "bg-[#e7edf4] text-[#345e83]",
    },
    {
      value: "restaurant",
      title: "Ẩm thực",
      shortTitle: "Ẩm thực",
      description: "Dê núi, cơm cháy và hương vị địa phương.",
      icon: "utensils",
      tone: "bg-[#f6e8e2] text-[#9d4b34]",
    },
    {
      value: "combo",
      title: "Combo trọn gói",
      shortTitle: "Combo",
      description: "Phương án ghép sẵn, thuận tiện và dễ kiểm soát chi phí.",
      icon: "sparkles",
      tone: "bg-[#ede7f5] text-[#6d4f91]",
    },
  ];

const collections: {
  title: string;
  description: string;
  tag: string;
  eyebrow: string;
  gradient: string;
  icon: IconName;
}[] = [
    {
      title: "Nhẹ nhàng cho gia đình",
      description: "Lịch dễ đi, phù hợp trẻ nhỏ và có thời gian nghỉ.",
      tag: "family",
      eyebrow: "Family friendly",
      gradient: "from-[#315f4b] to-[#173b2d]",
      icon: "users",
    },
    {
      title: "Một Ninh Bình lãng mạn",
      description: "View lúa, trải nghiệm thuyền và bữa tối cho hai người.",
      tag: "couple",
      eyebrow: "For two",
      gradient: "from-[#8a6049] to-[#503728]",
      icon: "heart",
    },
    {
      title: "Đi đẹp mà vẫn tiết kiệm",
      description: "Các lựa chọn có giá tốt, đủ trải nghiệm đặc trưng.",
      tag: "budget",
      eyebrow: "Smart budget",
      gradient: "from-[#536f63] to-[#283f37]",
      icon: "wallet",
    },
    {
      title: "Chậm lại giữa thiên nhiên",
      description: "Không gian xanh, thuyền nước và những hoạt động thư giãn.",
      tag: "nature",
      eyebrow: "Slow travel",
      gradient: "from-[#446e73] to-[#213e45]",
      icon: "map",
    },
  ];

const productGradient: Record<ProductType, string> = {
  hotel: "from-[#6d806f] to-[#283f34]",
  homestay: "from-[#9a7b57] to-[#513d28]",
  activity: "from-[#3e7962] to-[#174937]",
  restaurant: "from-[#a46245] to-[#60331f]",
  transport: "from-[#5e788e] to-[#293e52]",
  combo: "from-[#735d8e] to-[#3e3155]",
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function listingLink(params: { category?: string; tag?: string; q?: string }) {
  const search = new URLSearchParams();
  if (params.category && params.category !== "all") search.set("category", params.category);
  if (params.tag) search.set("tag", params.tag);
  if (params.q) search.set("q", params.q);
  const query = search.toString();
  return query ? `${ROUTES.products}?${query}` : ROUTES.products;
}

function ExploreProductCard({
  product,
  saved,
  added,
}: {
  product: ExploreProduct;
  saved: boolean;
  added: boolean;
}) {
  const background = product.image_url
    ? {
      backgroundImage: `linear-gradient(to top, rgba(12,32,24,.88), rgba(12,32,24,.05)), url("${product.image_url}")`,
    }
    : undefined;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link
        href={ROUTES.product(product.id)}
        style={background}
        className={`relative block h-48 overflow-hidden bg-cover bg-center ${product.image_url ? "" : `bg-gradient-to-br ${productGradient[product.type]}`
          }`}
      >
        {!product.image_url && (
          <>
            <span className="absolute -right-8 -top-10 h-36 w-36 rounded-full border-[25px] border-white/[0.07]" />
            <span className="absolute bottom-5 right-5 text-white/15">
              <Icon
                name={
                  product.type === "activity"
                    ? "ticket"
                    : product.type === "restaurant"
                      ? "utensils"
                      : product.type === "transport"
                        ? "car"
                        : product.type === "combo"
                          ? "sparkles"
                          : "building"
                }
                className="h-16 w-16"
              />
            </span>
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <Badge tone={availabilityTone[product.availability_status]}>
            {AVAILABILITY_LABELS[product.availability_status]}
          </Badge>
          {product.quality_score >= 5 && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-brand-ink">
              Nổi bật
            </span>
          )}
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-white/68">
            {PRODUCT_TYPE_LABELS[product.type]} · Ninh Bình
          </p>
          <h3 className="mt-1.5 line-clamp-2 text-xl font-bold leading-tight">{product.name}</h3>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="line-clamp-2 min-h-11 text-sm leading-relaxed text-brand-muted">
          {product.description ?? "Một lựa chọn có thể phù hợp với hành trình của bạn."}
        </p>

        <div className="mt-4 flex min-h-[52px] content-start flex-wrap gap-1.5">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-brand-cream px-2.5 py-1 text-[10px] font-semibold text-brand-muted"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-black/5 pt-4">
          <div>
            <p className="text-[11px] text-brand-muted">Giá tham khảo từ</p>
            <p className="mt-0.5 text-lg font-bold text-brand-green">
              {formatVND(product.price)}
              <span className="ml-1 text-[11px] font-medium text-brand-muted">
                {PRICE_UNIT_LABELS[product.price_unit]}
              </span>
            </p>
          </div>
          {product.duration_hours && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-muted">
              <Icon name="clock" className="h-3.5 w-3.5" />
              {product.duration_hours} giờ
            </span>
          )}
        </div>

        <div className="mt-4">
          <ExploreProductActions
            productId={product.id}
            firstTag={product.tags[0] ?? "nature"}
            availability={product.availability_status}
            initialSaved={saved}
            initialAdded={added}
          />
        </div>
      </div>
    </article>
  );
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const queryText = (one(searchParams?.q) ?? "").trim();
  const category = one(searchParams?.category) ?? "all";
  const tag = one(searchParams?.tag) ?? "";

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: productsData }, { data: savedData }, { data: cartData }] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, type, description, price, price_unit, duration_hours, tags, suitable_for, availability_status, quality_score, image_url",
      )
      .eq("is_active", true)
      .eq("status", "published")
      .order("quality_score", { ascending: false })
      .order("name", { ascending: true }),
    user
      ? supabase.from("saved_products").select("product_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from("cart_items").select("product_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] }),
  ]);

  const allProducts = (productsData as ExploreProduct[] | null) ?? [];
  const savedIds = new Set(
    ((savedData as { product_id: string }[] | null) ?? []).map((row) => row.product_id),
  );
  const cartIds = new Set(
    ((cartData as { product_id: string }[] | null) ?? []).map((row) => row.product_id),
  );

  const validTypes = new Set(["hotel", "homestay", "activity", "restaurant", "transport", "combo"]);
  const normalizedQuery = queryText.toLocaleLowerCase("vi-VN");
  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory =
      category === "all" || !validTypes.has(category) || product.type === category;
    const matchesTag = !tag || product.tags.includes(tag) || product.suitable_for.includes(tag);
    const haystack = `${product.name} ${product.description ?? ""} ${product.tags.join(" ")}`.toLocaleLowerCase(
      "vi-VN",
    );
    const matchesSearch = !normalizedQuery || haystack.includes(normalizedQuery);
    return matchesCategory && matchesTag && matchesSearch;
  });

  const typeCount = (type: ProductType | "all") =>
    type === "all" ? allProducts.length : allProducts.filter((product) => product.type === type).length;
  const hasFilters = Boolean(queryText || tag || (category && category !== "all"));

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[32px] bg-brand-green px-6 py-10 text-white shadow-card sm:px-10 sm:py-14">
        <span className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border-[48px] border-white/[0.055]" />
        <span className="pointer-events-none absolute -bottom-28 left-[42%] h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold">
            <Icon name="compass" className="h-4 w-4 text-brand-gold" />
            Thông tin dịch vụ rõ ràng
          </span>
          <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Cùng bạn tạo nên
            <br className="hidden sm:block" /> những hành trình đáng nhớ.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/[0.72] sm:text-base">
            Lưu trú, trải nghiệm, ẩm thực — tất cả ở Ninh Bình, giá luôn cập nhật để
            bạn chọn đúng.
          </p>

          <form
            action={ROUTES.products}
            method="get"
            className="mt-7 flex max-w-2xl flex-col gap-2 rounded-[22px] bg-white p-2 shadow-xl sm:flex-row"
          >
            <label className="flex min-w-0 flex-1 items-center gap-3 px-3">
              <Icon name="search" className="h-5 w-5 shrink-0 text-brand-green" />
              <input
                type="search"
                name="q"
                defaultValue={queryText}
                placeholder="Tìm Tràng An, homestay, ẩm thực..."
                className="h-11 min-w-0 flex-1 bg-transparent text-sm text-brand-ink outline-none placeholder:text-brand-muted/55"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-brand-gold px-6 text-sm font-bold text-brand-ink transition hover:brightness-95"
            >
              Khám phá ngay
              <Icon name="arrow-right" className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["Gia đình", "family"],
              ["Đi cặp đôi", "couple"],
              ["Thiên nhiên", "nature"],
              ["Tiết kiệm", "budget"],
              ["Ẩm thực", "food"],
            ].map(([label, value]) => (
              <Link
                key={value}
                href={listingLink({ tag: value })}
                className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/15 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
              Khám phá theo danh mục
            </p>
            <h2 className="mt-1 text-2xl font-bold text-brand-ink">Bạn muốn bắt đầu từ đâu?</h2>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <p className="hidden max-w-sm text-right text-xs leading-relaxed text-brand-muted sm:block">
              Chọn danh mục để xem ngay, hoặc duyệt tất cả dịch vụ.
            </p>
            <Link
              href={ROUTES.products}
              className="hidden items-center gap-2 rounded-full bg-brand-green px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-green-dark sm:inline-flex"
            >
              Xem tất cả {allProducts.length} dịch vụ
              <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {categoryItems.map((item) => {
            const active = category === item.value;
            return (
              <Link
                key={item.value}
                href={listingLink({ category: item.value, tag, q: queryText })}
                className={`group flex h-full min-h-[205px] flex-col rounded-[22px] border p-4 transition ${active
                    ? "border-brand-green/25 bg-white shadow-card"
                    : "border-black/5 bg-white/65 hover:-translate-y-0.5 hover:border-brand-green/15 hover:bg-white"
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`grid h-11 w-11 place-items-center rounded-2xl ${item.tone}`}>
                    <Icon name={item.icon} className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-brand-cream px-2.5 py-1 text-[10px] font-bold text-brand-muted">
                    {typeCount(item.value)}
                  </span>
                </div>
                <h3 className="mt-4 font-bold text-brand-ink">{item.title}</h3>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-brand-muted">
                  {item.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-green">
                  Xem dịch vụ
                  <Icon
                    name="arrow-right"
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            );
          })}
        </div>
        <Link
          href={ROUTES.products}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-green px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-green-dark sm:hidden"
        >
          Xem tất cả {allProducts.length} dịch vụ
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
      </section>

      {!hasFilters && (
        <section>
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
              Bộ sưu tập gợi ý
            </p>
            <h2 className="mt-1 text-2xl font-bold text-brand-ink">Chọn theo cách bạn muốn đi</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {collections.map((collection) => (
              <Link
                key={collection.tag}
                href={listingLink({ tag: collection.tag })}
                className={`group relative min-h-56 overflow-hidden rounded-[24px] bg-gradient-to-br ${collection.gradient} p-5 text-white shadow-card`}
              >
                <span className="absolute -right-8 -top-8 h-32 w-32 rounded-full border-[22px] border-white/[0.07]" />
                <div className="relative flex h-full flex-col justify-between">
                  <div>
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.12] text-brand-gold">
                      <Icon name={collection.icon} className="h-[19px] w-[19px]" />
                    </span>
                    <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                      {collection.eyebrow}
                    </p>
                    <h3 className="mt-2 text-xl font-bold leading-tight">{collection.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-white/65">
                      {collection.description}
                    </p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-white">
                    Khám phá bộ sưu tập
                    <Icon
                      name="arrow-right"
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
              Dữ liệu dịch vụ
            </p>
            <h2 className="mt-1 text-2xl font-bold text-brand-ink">
              {hasFilters ? "Kết quả phù hợp" : "Được yêu thích tại Ninh Bình"}
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Tìm thấy {filteredProducts.length} dịch vụ
              {queryText ? ` cho “${queryText}”` : ""}.
            </p>
          </div>

          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {category !== "all" && validTypes.has(category) && (
                <span className="rounded-full bg-brand-green-soft px-3 py-1.5 text-xs font-bold text-brand-green">
                  {PRODUCT_TYPE_LABELS[category as ProductType]}
                </span>
              )}
              {tag && (
                <span className="rounded-full bg-brand-gold-soft px-3 py-1.5 text-xs font-bold text-[#9f6818]">
                  #{tag}
                </span>
              )}
              <Link
                href={ROUTES.explore}
                className="inline-flex items-center gap-1 rounded-full border border-black/10 px-3 py-1.5 text-xs font-bold text-brand-muted hover:bg-white"
              >
                <Icon name="x" className="h-3.5 w-3.5" />
                Xóa bộ lọc
              </Link>
            </div>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <Card className="border-dashed py-12 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-green-soft text-brand-green">
              <Icon name="search" className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-brand-ink">
              Chưa tìm thấy dịch vụ phù hợp
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-brand-muted">
              Thử từ khóa khác, bớt bộ lọc, hoặc để NiBi AI gợi ý lựa chọn phù hợp
              nhất.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <ButtonLink href={ROUTES.explore} variant="outline">
                Xóa bộ lọc
              </ButtonLink>
              <ButtonLink href={ROUTES.plan}>
                <Icon name="sparkles" className="h-4 w-4" />
                Hỏi NiBi AI
              </ButtonLink>
            </div>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ExploreProductCard
                key={product.id}
                product={product}
                saved={savedIds.has(product.id)}
                added={cartIds.has(product.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-5 rounded-[28px] border border-brand-green/10 bg-brand-green-soft/70 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-brand-green shadow-sm">
            <Icon name="shield" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-brand-ink">Giá thật, quyết định là của bạn</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brand-muted">
              Giá hiển thị luôn được cập nhật. Thêm vào giỏ chưa phải là đặt chỗ — đội ngũ
              sẽ xác nhận trước khi hoàn tất booking.
            </p>
          </div>
        </div>
        <ButtonLink href={ROUTES.plan} className="shrink-0">
          Tạo lịch trình với NiBi AI
          <Icon name="arrow-right" className="h-4 w-4" />
        </ButtonLink>
      </section>
    </div>
  );
}
