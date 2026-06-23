import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { productUpdateSchema } from "@/lib/validation/product";

/** PATCH /api/products/[id] — sửa / toggle active / đổi availability (admin). */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { supabase, response } = await requireAdmin();
  if (response) return response;

  const body = await request.json().catch(() => null);
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const update: Record<string, unknown> = { ...parsed.data };
  if ("image_url" in update) update.image_url = update.image_url ? update.image_url : null;

  const { data, error } = await supabase
    .from("products")
    .update(update)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
