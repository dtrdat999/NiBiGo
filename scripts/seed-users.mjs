// Tạo 2 tài khoản demo (admin + guest) qua Supabase Admin API.
// Dùng secret/service-role key, set email_confirm để đăng nhập ngay.
// Chạy: node scripts/seed-users.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("❌ Thiếu URL hoặc SERVICE_ROLE/secret key trong .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const PASSWORD = "nibigo2026";
const users = [
  { email: "admin@nibigo.demo", full_name: "Đặng Trần Đạt", role: "admin" },
  { email: "guest@nibigo.demo", full_name: "Khách Demo", role: "guest" },
];

for (const u of users) {
  const { error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: u.full_name },
  });

  if (error) {
    if (/already|exists|registered/i.test(error.message)) {
      console.log(`• ${u.email}: đã tồn tại — bỏ qua tạo, vẫn cập nhật role.`);
    } else {
      console.log(`✗ ${u.email}: ${error.message}`);
      continue;
    }
  } else {
    console.log(`✓ Đã tạo ${u.email}`);
  }

  const { error: upErr } = await supabase
    .from("profiles")
    .update({ role: u.role, full_name: u.full_name })
    .eq("email", u.email);
  if (upErr) console.log(`  ! cập nhật role lỗi: ${upErr.message}`);
  else console.log(`  → role = ${u.role}`);
}

console.log(`\n🔑 Mật khẩu cho cả hai tài khoản: ${PASSWORD}`);
