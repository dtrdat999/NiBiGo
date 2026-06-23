import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Đổi `code` (từ link xác nhận email) lấy session rồi điều hướng tiếp.
 * Dùng khi bật Confirm email ở Supabase Auth.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
