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

  const { error } = await supabase.from("saved_products").upsert(
    { user_id: user!.id, product_id: productId },
    { onConflict: "user_id,product_id", ignoreDuplicates: true },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ saved: true });
}

export async function DELETE(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const productId = await readProductId(request);
  if (!productId) {
    return NextResponse.json({ error: "Thiếu product_id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("saved_products")
    .delete()
    .eq("user_id", user!.id)
    .eq("product_id", productId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ saved: false });
}
