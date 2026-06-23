import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client với SERVICE ROLE — bỏ qua RLS.
 * CHỈ dùng trong server code có kiểm soát (vd ghi tour_packages, sinh booking code).
 * KHÔNG bao giờ import file này vào Client Component.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
