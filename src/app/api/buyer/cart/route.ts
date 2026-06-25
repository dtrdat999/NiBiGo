import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-helpers";

async function readProductId(request: Request) {
  const body = await request.json().catch(() => null);
  return typeof body?.product_id === "string" && body.product_id.length > 0
    ? body.product_id
    : null;
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const productId = await readProductId(request);
  if (!productId) {
    return NextResponse.json({ error: "Thiếu product_id" }, { status: 400 });
  }

  const { data: product } = await supabase
    .from("products")
    .select("availability_status")
    .eq("id", productId)
    .single();

  if (!product || product.availability_status === "sold_out") {
    return NextResponse.json(
      { error: "Dịch vụ này hiện không thể thêm vào danh sách đã chọn." },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("cart_items").upsert(
    { user_id: user!.id, product_id: productId, quantity: 1 },
    { onConflict: "user_id,product_id" },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ added: true });
}

export async function DELETE(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const productId = await readProductId(request);
  if (!productId) {
    return NextResponse.json({ error: "Thiếu product_id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user!.id)
    .eq("product_id", productId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ added: false });
}
