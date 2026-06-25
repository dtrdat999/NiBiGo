import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-helpers";

/** POST /api/buyer/orders/[id]/pay — thanh toán demo. */
export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { supabase, response } = await requireUser();
  if (response) return response;

  const { data, error } = await supabase.rpc("buyer_pay_order_demo", {
    p_order_id: params.id,
  });

  if (error) {
    const message = error.message.includes("function")
      ? "Chưa thể thanh toán. Hãy kiểm tra migration 0010."
      : error.message;
    return NextResponse.json({ error: message }, { status: 409 });
  }

  return NextResponse.json({ data });
}
