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
import { cn, formatVND } from "@/lib/utils";
import type {
  AvailabilityStatus,
  ProductType,
  TravelProduct,
} from "@/types";

export const metadata: Metadata = {
  title: "Danh sách dịch vụ Ninh Bình — NiBiGo",
  description:
    "Tìm kiếm, lọc và so sánh tour, lưu trú, di chuyển, ẩm thực và combo du lịch Ninh Bình.",
};
export const dynamic = "force-dynamic";

type ListingProduct = Pick<
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
> & { created_at?: string };

type ViewMode = "grid" | "list";
type SortMode = "recommended" | "price-asc" | "price-desc" | "newest";

type FilterState = {
  q: string;
  category: string;
  prices: string[];
  areas: string[];
  suitable: string[];
  tags: string[];
  availability: string[];
  sort: SortMode;
  view: ViewMode;
};

const categories: { value: ProductType | "all"; label: string; icon: IconName }[] = [
  { value: "all", label: "Tất cả", icon: "compass" },
  { value: "activity", label: "Tour & trải nghiệm", icon: "ticket" },
  { value: "hotel", label: "Khách sạn", icon: "building" },
  { value: "homestay", label: "Homestay", icon: "home" },
  { value: "transport", label: "Di chuyển", icon: "car" },
  { value: "restaurant", label: "Ẩm thực", icon: "utensils" },
  { value: "combo", label: "Combo", icon: "sparkles" },
];

const priceOptions = [
  { value: "under-500", label: "Dưới 500.000đ" },
  { value: "500-1000", label: "500.000đ – 1 triệu" },
  { value: "1000-3000", label: "1 – 3 triệu" },
  { value: "over-3000", label: "Trên 3 triệu" },
];

const areaOptions = [
  { value: "trang-an", label: "Tràng An" },
  { value: "tam-coc", label: "Tam Cốc" },
  { value: "hang-mua", label: "Hang Múa" },
  { value: "bai-dinh", label: "Bái Đính" },
  { value: "cuc-phuong", label: "Cúc Phương" },
  { value: "hoa-lu", label: "Hoa Lư" },
];

const suitableOptions = [
  { value: "family", label: "Gia đình" },
  { value: "couple", label: "Cặp đôi" },
  { value: "group", label: "Nhóm bạn" },
  { value: "kids", label: "Có trẻ em" },
  { value: "elderly", label: "Người lớn tuổi" },
];

const tagOptions = [
  { value: "nature", label: "Thiên nhiên" },
  { value: "culture", label: "Văn hóa" },
  { value: "food", label: "Ẩm thực" },
  { value: "budget", label: "Tiết kiệm" },
  { value: "premium", label: "Cao cấp" },
  { value: "relaxing", label: "Thư giãn" },
  { value: "photo", label: "Chụp ảnh" },
  { value: "active", label: "Năng động" },
];

const availabilityOptions: { value: AvailabilityStatus; label: string }[] = [
  { value: "available", label: "Còn chỗ" },
  { value: "limited", label: "Sắp hết" },
  { value: "need_confirmation", label: "Cần xác nhận" },
  { value: "sold_out", label: "Hết chỗ" },
];

const productGradient: Record<ProductType, string> = {
  hotel: "from-[#738678] to-[#2d4438]",
  homestay: "from-[#a0815d] to-[#56422e]",
  activity: "from-[#477d68] to-[#184a38]",
  restaurant: "from-[#a9694e] to-[#623722]",
  transport: "from-[#627c92] to-[#2c4256]",
  combo: "from-[#776392] to-[#403459]",
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function many(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function buildUrl(state: FilterState, patch: Partial<FilterState> = {}) {
  const next = { ...state, ...patch };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.category && next.category !== "all") params.set("category", next.category);
  next.prices.forEach((value) => params.append("price", value));
  next.areas.forEach((value) => params.append("area", value));
  next.suitable.forEach((value) => params.append("suitable", value));
  next.tags.forEach((value) => params.append("tag", value));
  next.availability.forEach((value) => params.append("availability", value));
  if (next.sort !== "recommended") params.set("sort", next.sort);
  if (next.view !== "grid") params.set("view", next.view);
  const query = params.toString();
  return query ? `${ROUTES.products}?${query}` : ROUTES.products;
}

function inferArea(product: ListingProduct) {
  const text = `${product.name} ${product.description ?? ""}`.toLocaleLowerCase("vi-VN");
  if (text.includes("tràng an")) return { value: "trang-an", label: "Tràng An" };
  if (text.includes("tam cốc") || text.includes("tam coc")) {
    return { value: "tam-coc", label: "Tam Cốc" };
  }
  if (text.includes("hang múa")) return { value: "hang-mua", label: "Hang Múa" };
  if (text.includes("bái đính")) return { value: "bai-dinh", label: "Bái Đính" };
  if (text.includes("cúc phương")) return { value: "cuc-phuong", label: "Cúc Phương" };
  if (text.includes("hoa lư")) return { value: "hoa-lu", label: "Hoa Lư" };
  return { value: "ninh-binh", label: "Ninh Bình" };
}

function matchesPrice(price: number, selected: string[]) {
  if (selected.length === 0) return true;
  return selected.some((bucket) => {
    if (bucket === "under-500") return price < 500_000;
    if (bucket === "500-1000") return price >= 500_000 && price <= 1_000_000;
    if (bucket === "1000-3000") return price > 1_000_000 && price <= 3_000_000;
    if (bucket === "over-3000") return price > 3_000_000;
    return true;
  });
}

function FilterCheckboxes({
  name,
  options,
  selected,
  prefix,
}: {
  name: string;
  options: { value: string; label: string }[];
  selected: string[];
  prefix: string;
}) {
  return (
    <div className="space-y-2.5">
      {options.map((option) => {
        const id = `${prefix}-${name}-${option.value}`;
        return (
          <label key={option.value} htmlFor={id} className="flex cursor-pointer items-center gap-2.5">
            <input
              id={id}
              type="checkbox"
              name={name}
              value={option.value}
              defaultChecked={selected.includes(option.value)}
              className="h-4 w-4 rounded border-black/[0.15] accent-brand-green"
            />
            <span className="text-sm text-brand-muted">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}

function HiddenState({
  state,
  exclude = [],
}: {
  state: FilterState;
  exclude?: string[];
}) {
  return (
    <>
      {!exclude.includes("q") && state.q && <input type="hidden" name="q" value={state.q} />}
      {!exclude.includes("category") && state.category !== "all" && (
        <input type="hidden" name="category" value={state.category} />
      )}
      {!exclude.includes("price") &&
        state.prices.map((value) => <input key={value} type="hidden" name="price" value={value} />)}
      {!exclude.includes("area") &&
        state.areas.map((value) => <input key={value} type="hidden" name="area" value={value} />)}
      {!exclude.includes("suitable") &&
        state.suitable.map((value) => (
          <input key={value} type="hidden" name="suitable" value={value} />
        ))}
      {!exclude.includes("tag") &&
        state.tags.map((value) => <input key={value} type="hidden" name="tag" value={value} />)}
      {!exclude.includes("availability") &&
        state.availability.map((value) => (
          <input key={value} type="hidden" name="availability" value={value} />
        ))}
      {!exclude.includes("sort") && state.sort !== "recommended" && (
        <input type="hidden" name="sort" value={state.sort} />
      )}
      {!exclude.includes("view") && state.view !== "grid" && (
        <input type="hidden" name="view" value={state.view} />
      )}
    </>
  );
}

function FiltersForm({ state, prefix }: { state: FilterState; prefix: string }) {
  return (
    <form action={ROUTES.products} method="get" className="space-y-6">
      <HiddenState
        state={state}
        exclude={["price", "area", "suitable", "tag", "availability"]}
      />

      <fieldset>
        <legend className="mb-3 text-sm font-bold text-brand-ink">Khoảng giá</legend>
        <FilterCheckboxes
          name="price"
          options={priceOptions}
          selected={state.prices}
          prefix={prefix}
        />
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-bold text-brand-ink">Khu vực</legend>
        <FilterCheckboxes
          name="area"
          options={areaOptions}
          selected={state.areas}
          prefix={prefix}
        />
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-bold text-brand-ink">Phù hợp với</legend>
        <FilterCheckboxes
          name="suitable"
          options={suitableOptions}
          selected={state.suitable}
          prefix={prefix}
        />
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-bold text-brand-ink">Trải nghiệm</legend>
        <FilterCheckboxes
          name="tag"
          options={tagOptions}
          selected={state.tags}
          prefix={prefix}
        />
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-bold text-brand-ink">Tình trạng dịch vụ</legend>
        <FilterCheckboxes
          name="availability"
          options={availabilityOptions}
          selected={state.availability}
          prefix={prefix}
        />
      </fieldset>

      <div className="sticky bottom-3 grid grid-cols-2 gap-2 bg-white pt-2">
        <Link
          href={ROUTES.products}
          className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 text-xs font-bold text-brand-muted transition hover:bg-brand-cream"
        >
          Đặt lại
        </Link>
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-white transition hover:bg-brand-green-dark"
        >
          Áp dụng lọc
        </button>
      </div>
    </form>
  );
}

function ProductVisual({ product }: { product: ListingProduct }) {
  const background = product.image_url
    ? {
        backgroundImage: `linear-gradient(to top, rgba(12,32,24,.82), rgba(12,32,24,.04)), url("${product.image_url}")`,
      }
    : undefined;
  const typeIcon: IconName =
    product.type === "activity"
      ? "ticket"
      : product.type === "restaurant"
        ? "utensils"
        : product.type === "transport"
          ? "car"
          : product.type === "combo"
            ? "sparkles"
            : "building";

  return (
    <Link href={ROUTES.product(product.id)} className="block h-full">
    <div
      style={background}
      className={`relative h-full min-h-52 overflow-hidden bg-cover bg-center ${
        product.image_url ? "" : `bg-gradient-to-br ${productGradient[product.type]}`
      }`}
    >
      {!product.image_url && (
        <>
          <span className="absolute -right-10 -top-12 h-40 w-40 rounded-full border-[28px] border-white/[0.065]" />
          <Icon
            name={typeIcon}
            className="absolute bottom-5 right-5 h-20 w-20 text-white/[0.13]"
          />
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/[0.55] via-transparent to-transparent" />
      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
        <Badge tone={availabilityTone[product.availability_status]}>
          {AVAILABILITY_LABELS[product.availability_status]}
        </Badge>
        {product.quality_score >= 5 && (
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-brand-ink">
            Được yêu thích
          </span>
        )}
      </div>
    </div>
    </Link>
  );
}

function ListingProductCard({
  product,
  view,
  saved,
  added,
}: {
  product: ListingProduct;
  view: ViewMode;
  saved: boolean;
  added: boolean;
}) {
  const area = inferArea(product);

  if (view === "list") {
    return (
      <article className="overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-card transition hover:border-brand-green/[0.15] hover:shadow-lg">
        <div className="grid md:grid-cols-[240px_1fr_220px]">
          <ProductVisual product={product} />
          <div className="p-5 md:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-brand-gold">
              {PRODUCT_TYPE_LABELS[product.type]}
            </p>
            <Link
              href={ROUTES.product(product.id)}
              className="mt-2 block text-xl font-bold leading-tight text-brand-ink transition hover:text-brand-green"
            >
              {product.name}
            </Link>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-muted">
              <Icon name="map-pin" className="h-4 w-4 text-brand-green" />
              {area.label}, Ninh Bình
            </p>
            <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-brand-muted">
              {product.description}
            </p>
            <div className="mt-4 flex min-h-[52px] content-start flex-wrap gap-1.5">
              {product.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-brand-cream px-2.5 py-1 text-[10px] font-semibold text-brand-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between border-t border-black/5 bg-[#fffdf9] p-5 md:border-l md:border-t-0">
            <div>
              <p className="text-xs text-brand-muted">Giá tham khảo từ</p>
              <p className="mt-1 text-xl font-bold text-brand-green">
                {formatVND(product.price)}
              </p>
              <p className="mt-0.5 text-xs text-brand-muted">
                {PRICE_UNIT_LABELS[product.price_unit]}
              </p>
              {product.duration_hours && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-muted">
                  <Icon name="clock" className="h-4 w-4" />
                  Khoảng {product.duration_hours} giờ
                </p>
              )}
            </div>
            <div className="mt-5">
              <ExploreProductActions
                productId={product.id}
                firstTag={product.tags[0] ?? "nature"}
                availability={product.availability_status}
                initialSaved={saved}
                initialAdded={added}
              />
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-card transition hover:-translate-y-0.5 hover:border-brand-green/[0.15] hover:shadow-lg">
      <div className="h-48">
        <ProductVisual product={product} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
            {PRODUCT_TYPE_LABELS[product.type]}
          </p>
          {product.duration_hours && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-muted">
              <Icon name="clock" className="h-3.5 w-3.5" />
              {product.duration_hours} giờ
            </span>
          )}
        </div>
        <Link
          href={ROUTES.product(product.id)}
          className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-brand-ink transition hover:text-brand-green"
        >
          {product.name}
        </Link>
        <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-muted">
          <Icon name="map-pin" className="h-3.5 w-3.5 text-brand-green" />
          {area.label}, Ninh Bình
        </p>
        <p className="mt-3 line-clamp-2 min-h-11 text-sm leading-relaxed text-brand-muted">
          {product.description}
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

        <div className="mt-auto border-t border-black/5 pt-4">
          <p className="text-[11px] text-brand-muted">Giá tham khảo từ</p>
          <p className="mt-0.5 text-lg font-bold text-brand-green">
            {formatVND(product.price)}
            <span className="ml-1 text-[11px] font-medium text-brand-muted">
              {PRICE_UNIT_LABELS[product.price_unit]}
            </span>
          </p>
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

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const rawSort = one(searchParams?.sort);
  const rawView = one(searchParams?.view);
  const state: FilterState = {
    q: (one(searchParams?.q) ?? "").trim(),
    category: one(searchParams?.category) ?? "all",
    prices: many(searchParams?.price),
    areas: many(searchParams?.area),
    suitable: many(searchParams?.suitable),
    tags: many(searchParams?.tag),
    availability: many(searchParams?.availability),
    sort:
      rawSort === "price-asc" ||
      rawSort === "price-desc" ||
      rawSort === "newest"
        ? rawSort
        : "recommended",
    view: rawView === "list" ? "list" : "grid",
  };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: productsData }, { data: savedData }, { data: cartData }] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, type, description, price, price_unit, duration_hours, tags, suitable_for, availability_status, quality_score, image_url, created_at",
      )
      .eq("is_active", true)
      .eq("status", "published"),
    user
      ? supabase.from("saved_products").select("product_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from("cart_items").select("product_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] }),
  ]);

  const allProducts = (productsData as ListingProduct[] | null) ?? [];
  const savedIds = new Set(
    ((savedData as { product_id: string }[] | null) ?? []).map((row) => row.product_id),
  );
  const cartIds = new Set(
    ((cartData as { product_id: string }[] | null) ?? []).map((row) => row.product_id),
  );
  const validTypes = new Set(["hotel", "homestay", "activity", "restaurant", "transport", "combo"]);
  const normalizedQuery = state.q.toLocaleLowerCase("vi-VN");

  const filteredProducts = allProducts.filter((product) => {
    const area = inferArea(product);
    const searchable =
      `${product.name} ${product.description ?? ""} ${product.tags.join(" ")} ${area.label}`.toLocaleLowerCase(
        "vi-VN",
      );
    const categoryMatch =
      state.category === "all" ||
      !validTypes.has(state.category) ||
      product.type === state.category;
    const searchMatch = !normalizedQuery || searchable.includes(normalizedQuery);
    const priceMatch = matchesPrice(product.price, state.prices);
    const areaMatch = state.areas.length === 0 || state.areas.includes(area.value);
    const suitableMatch =
      state.suitable.length === 0 ||
      state.suitable.some(
        (value) => product.suitable_for.includes(value) || product.tags.includes(value),
      );
    const tagMatch =
      state.tags.length === 0 || state.tags.some((value) => product.tags.includes(value));
    const availabilityMatch =
      state.availability.length === 0 ||
      state.availability.includes(product.availability_status);

    return (
      categoryMatch &&
      searchMatch &&
      priceMatch &&
      areaMatch &&
      suitableMatch &&
      tagMatch &&
      availabilityMatch
    );
  });

  filteredProducts.sort((a, b) => {
    if (state.sort === "price-asc") return a.price - b.price;
    if (state.sort === "price-desc") return b.price - a.price;
    if (state.sort === "newest") {
      return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
    }
    return b.quality_score - a.quality_score || a.name.localeCompare(b.name, "vi");
  });

  const activeFilterCount =
    state.prices.length +
    state.areas.length +
    state.suitable.length +
    state.tags.length +
    state.availability.length;

  const currentCategory =
    categories.find((item) => item.value === state.category) ?? categories[0];

  return (
    <div className="space-y-7">
      <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href={ROUTES.explore}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-green hover:underline"
            >
              ← Quay lại Khám phá
            </Link>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
              Kho dịch vụ Ninh Bình
            </p>
            <h1 className="mt-1 text-3xl font-bold text-brand-ink">
              {currentCategory.value === "all" ? "Tất cả dịch vụ" : currentCategory.label}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-muted">
              So sánh dịch vụ theo giá, khu vực, đối tượng phù hợp và trạng thái còn chỗ. Thêm vào
              danh sách đã chọn chưa có nghĩa là booking đã được xác nhận.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-brand-green-soft px-4 py-3 text-brand-green">
            <Icon name="shield" className="h-5 w-5" />
            <span className="text-xs font-bold">Giá hiển thị rõ theo từng dịch vụ</span>
          </div>
        </div>
      </section>

      <section className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2">
          {categories.map((item) => {
            const active =
              item.value === state.category ||
              (item.value === "all" && !validTypes.has(state.category));
            return (
              <Link
                key={item.value}
                href={buildUrl(state, { category: item.value })}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition",
                  active
                    ? "border-brand-green bg-brand-green text-white shadow-sm"
                    : "border-black/5 bg-white text-brand-muted hover:border-brand-green/[0.15] hover:text-brand-green",
                )}
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-[24px] border border-black/5 bg-white p-3 shadow-card sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <form action={ROUTES.products} method="get" className="flex min-w-0 flex-1 gap-2">
            <HiddenState state={state} exclude={["q", "sort"]} />
            <label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-brand-cream px-4">
              <Icon name="search" className="h-5 w-5 shrink-0 text-brand-green" />
              <input
                type="search"
                name="q"
                defaultValue={state.q}
                placeholder="Tìm theo tên, khu vực hoặc trải nghiệm..."
                className="h-12 min-w-0 flex-1 bg-transparent text-sm text-brand-ink outline-none placeholder:text-brand-muted/[0.55]"
              />
            </label>
            <select
              name="sort"
              defaultValue={state.sort}
              aria-label="Sắp xếp sản phẩm"
              className="hidden h-12 rounded-2xl border border-black/5 bg-white px-4 text-sm font-semibold text-brand-ink outline-none focus:border-brand-green sm:block"
            >
              <option value="recommended">Đề xuất phù hợp</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
              <option value="newest">Mới nhất</option>
            </select>
            <button
              type="submit"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-green text-white transition hover:bg-brand-green-dark"
              aria-label="Tìm kiếm và sắp xếp"
            >
              <Icon name="arrow-right" className="h-5 w-5" />
            </button>
          </form>

          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <details className="relative lg:hidden">
              <summary className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-black/10 px-4 text-xs font-bold text-brand-ink">
                <Icon name="sliders" className="h-4 w-4" />
                Bộ lọc
                {activeFilterCount > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-green px-1 text-[10px] text-white">
                    {activeFilterCount}
                  </span>
                )}
              </summary>
              <div className="absolute left-0 top-12 z-30 max-h-[70vh] w-[min(88vw,340px)] overflow-y-auto rounded-2xl border border-black/5 bg-white p-5 shadow-xl">
                <FiltersForm state={state} prefix="mobile" />
              </div>
            </details>

            <div className="flex items-center rounded-full bg-brand-cream p-1">
              <Link
                href={buildUrl(state, { view: "grid" })}
                aria-label="Xem dạng lưới"
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full transition",
                  state.view === "grid"
                    ? "bg-white text-brand-green shadow-sm"
                    : "text-brand-muted",
                )}
              >
                <Icon name="grid" className="h-4 w-4" />
              </Link>
              <Link
                href={buildUrl(state, { view: "list" })}
                aria-label="Xem dạng danh sách"
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full transition",
                  state.view === "list"
                    ? "bg-white text-brand-green shadow-sm"
                    : "text-brand-muted",
                )}
              >
                <Icon name="list" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[238px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-[24px] border border-black/5 bg-white p-5 shadow-card">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="sliders" className="h-4 w-4 text-brand-green" />
                <h2 className="font-bold text-brand-ink">Bộ lọc</h2>
              </div>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-brand-green-soft px-2 py-1 text-[10px] font-bold text-brand-green">
                  {activeFilterCount} đã chọn
                </span>
              )}
            </div>
            <FiltersForm state={state} prefix="desktop" />
          </div>
        </aside>

        <main>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-brand-ink">
                {filteredProducts.length} dịch vụ phù hợp
              </h2>
              <p className="mt-1 text-xs text-brand-muted">
                Hiển thị theo{" "}
                {state.sort === "price-asc"
                  ? "giá thấp đến cao"
                  : state.sort === "price-desc"
                    ? "giá cao đến thấp"
                    : state.sort === "newest"
                      ? "mới nhất"
                      : "mức độ đề xuất"}
              </p>
            </div>

            {(state.q || activeFilterCount > 0) && (
              <Link
                href={buildUrl(state, {
                  q: "",
                  prices: [],
                  areas: [],
                  suitable: [],
                  tags: [],
                  availability: [],
                })}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-green"
              >
                <Icon name="x" className="h-3.5 w-3.5" />
                Xóa tìm kiếm và bộ lọc
              </Link>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <Card className="border-dashed py-14 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-green-soft text-brand-green">
                <Icon name="search" className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-brand-ink">
                Không tìm thấy dịch vụ phù hợp
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-brand-muted">
                Hãy giảm bớt tiêu chí lọc hoặc để NiBi AI tìm phương án gần nhất với nhu cầu của bạn.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <ButtonLink href={ROUTES.products} variant="outline">
                  Xóa bộ lọc
                </ButtonLink>
                <ButtonLink href={ROUTES.plan}>
                  <Icon name="sparkles" className="h-4 w-4" />
                  Hỏi NiBi AI
                </ButtonLink>
              </div>
            </Card>
          ) : (
            <div
              className={cn(
                state.view === "grid"
                  ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                  : "space-y-4",
              )}
            >
              {filteredProducts.map((product) => (
                <ListingProductCard
                  key={product.id}
                  product={product}
                  view={state.view}
                  saved={savedIds.has(product.id)}
                  added={cartIds.has(product.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <section className="flex flex-col gap-4 rounded-[26px] bg-brand-ink p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-brand-gold">
            Chưa biết nên chọn gì?
          </p>
          <h2 className="mt-1 text-xl font-bold">Ghép các dịch vụ thành hành trình phù hợp với bạn.</h2>
          <p className="mt-1 text-sm text-white/60">
            Bạn sẽ được xem lại lịch trình, tổng chi phí và những điều cần xác nhận trước khi gửi yêu cầu.
          </p>
        </div>
        <ButtonLink href={ROUTES.plan} variant="secondary" className="shrink-0">
          Bắt đầu lên kế hoạch
          <Icon name="arrow-right" className="h-4 w-4" />
        </ButtonLink>
      </section>
    </div>
  );
}
