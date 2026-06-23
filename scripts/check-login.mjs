// Kiểm tra publishable/anon key đăng nhập được (key trình duyệt dùng).
// Chạy: node scripts/check-login.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } },
);

const { data, error } = await supabase.auth.signInWithPassword({
  email: "guest@nibigo.demo",
  password: "nibigo2026",
});

if (error) {
  console.log("❌ Đăng nhập bằng publishable key lỗi:", error.message);
  process.exit(1);
}
console.log("✅ Đăng nhập OK bằng publishable key — user:", data.user.email);
