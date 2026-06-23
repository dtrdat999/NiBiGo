import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { productInputSchema } from "@/lib/validation/product";

/** GET /api/products — danh sách sản phẩm (admin). */
export async function GET() {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

/** POST /api/products — tạo sản phẩm mới (admin). */
export async function POST(request: Request) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const body = await request.json().catch(() => null);
  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // MVP: gắn vào điểm đến Ninh Bình.
  const { data: dest } = await supabase
    .from("destinations")
    .select("id")
    .eq("slug", "ninh-binh")
    .single();
  if (!dest) {
    return NextResponse.json(
      { error: "Chưa có điểm đến Ninh Bình — hãy chạy seed.sql trước." },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const { data, error } = await supabase
    .from("products")
    .insert({
      ...input,
      image_url: input.image_url ? input.image_url : null,
      destination_id: dest.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
