import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Yêu cầu user đăng nhập. Trả về { supabase, user, response }.
 * Nếu response != null → route handler nên `return response` ngay.
 */
export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      response: NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 }),
    };
  }
  return { supabase, user, response: null as NextResponse | null };
}

/** Yêu cầu user là admin. Kiểm tra role ở profiles (defense-in-depth cùng RLS). */
export async function requireAdmin() {
  const { supabase, user, response } = await requireUser();
  if (response) return { supabase, user, response };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "admin") {
    return {
      supabase,
      user,
      response: NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 }),
    };
  }
  return { supabase, user, response: null as NextResponse | null };
}
