import { NextResponse } from "next/server";
import { requireSales } from "@/lib/api-helpers";
import { orderTransitionSchema } from "@/lib/validation/order";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { supabase, response } = await requireSales();
  if (response) return response;

  const parsed = orderTransitionSchema.safeParse(
    await request.json().catch(() => ({})),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase.rpc("sales_transition_order", {
    p_order_id: params.id,
    p_to_status: parsed.data.toStatus,
    p_note: parsed.data.note,
  });

  if (error) {
    const message = error.message.includes("function")
      ? "Chưa thể cập nhật. Hãy kiểm tra migration 0010."
      : error.message;
    return NextResponse.json({ error: message }, { status: 409 });
  }

  return NextResponse.json({ data });
}
