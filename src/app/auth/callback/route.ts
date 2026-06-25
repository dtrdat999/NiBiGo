import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { homeRouteForRole } from "@/lib/auth-routing";

/**
 * Đổi `code` (từ link xác nhận email) lấy session rồi điều hướng tiếp.
 * Dùng khi bật Confirm email ở Supabase Auth.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (next) return NextResponse.redirect(`${origin}${next}`);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profile } = user
        ? await supabase.from("profiles").select("role").eq("id", user.id).single()
        : { data: null };
      return NextResponse.redirect(`${origin}${homeRouteForRole(profile?.role)}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
