import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-helpers";
import { checkoutSchema } from "@/lib/validation/order";

/** POST /api/buyer/orders — tạo order từ giỏ dịch vụ. */
export async function POST(request: Request) {
  const { supabase, response } = await requireUser();
  if (response) return response;

  const parsed = checkoutSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase.rpc("buyer_create_order_from_cart", {
    p_note: parsed.data.note ?? null,
  });

  if (error) {
    const message = error.message.includes("function")
      ? "Chưa thể đặt. Hãy kiểm tra migration 0010."
      : error.message;
    return NextResponse.json({ error: message }, { status: 409 });
  }

  return NextResponse.json({ data });
}
