import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CartView, type CartLine } from "@/components/buyer/CartView";
import type { CartItem, TravelProduct } from "@/types";

export const metadata: Metadata = { title: "Giỏ dịch vụ — NiBiGo AI Travel Platform" };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: cartData } = user
    ? await supabase
        .from("cart_items")
        .select("product_id, quantity, added_at")
        .eq("user_id", user.id)
        .order("added_at", { ascending: false })
    : { data: [] };
  const cart = (cartData as Pick<CartItem, "product_id" | "quantity" | "added_at">[] | null) ?? [];

  const productIds = cart.map((item) => item.product_id);
  const { data: productData } = productIds.length
    ? await supabase
        .from("products")
        .select("id, name, type, price, price_unit, image_url, availability_status")
        .in("id", productIds)
    : { data: [] };
  const productById = new Map(
    ((productData as TravelProduct[] | null) ?? []).map((product) => [product.id, product]),
  );

  const items: CartLine[] = cart
    .map((line) => {
      const product = productById.get(line.product_id);
      if (!product) return null;
      return {
        product_id: product.id,
        name: product.name,
        type: product.type,
        price: product.price,
        price_unit: product.price_unit,
        image_url: product.image_url,
        availability_status: product.availability_status,
        quantity: line.quantity,
      } satisfies CartLine;
    })
    .filter((line): line is CartLine => line !== null);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Giỏ dịch vụ</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Các dịch vụ bạn đã chọn. Đặt đơn để Sales xác nhận và xử lý.
        </p>
      </div>
      <CartView initialItems={items} />
    </div>
  );
}
