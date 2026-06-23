import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client cho Client Components (browser).
 * Dùng anon key — an toàn vì đi kèm RLS.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
