// Chẩn đoán Phase 8 + tạo 4 demo user + gán role.
// Chạy: node scripts/setup-phase8.mjs
// Dùng SERVICE_ROLE key (bypass RLS). KHÔNG chạy DDL — chỉ kiểm tra + data.
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
  console.error("❌ Thiếu URL hoặc SERVICE_ROLE_KEY trong .env.local");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

const PASSWORD = "nibigo2026";
const USERS = [
  { email: "buyer@nibigo.demo", role: "buyer", name: "Buyer Demo" },
  { email: "sales@nibigo.demo", role: "sales", name: "Sales Demo" },
  { email: "editor@nibigo.demo", role: "editor", name: "Editor Demo" },
  { email: "admin@nibigo.demo", role: "admin", name: "Admin Demo" },
];

async function tableOk(name) {
  const { error } = await sb.from(name).select("*", { count: "exact", head: true });
  return error ? `❌ ${error.message}` : "✅";
}

console.log("── 1. Kiểm tra schema (Phase 8) ─────────────────");
console.log("  products            :", await tableOk("products"));
console.log("  booking_status_logs :", await tableOk("booking_status_logs"));
console.log("  orders              :", await tableOk("orders"));
console.log("  cart_items          :", await tableOk("cart_items"));
console.log("  articles            :", await tableOk("articles"));
console.log("  product_locations   :", await tableOk("product_locations"));

console.log("\n── 2. Tạo / xác nhận 4 demo user ────────────────");
for (const u of USERS) {
  const { error } = await sb.auth.admin.createUser({
    email: u.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: u.name },
  });
  if (error) {
    if (/already|registered|exists/i.test(error.message)) {
      console.log(`  ${u.email.padEnd(22)} : đã tồn tại (bỏ qua)`);
    } else {
      console.log(`  ${u.email.padEnd(22)} : ❌ ${error.message}`);
    }
  } else {
    console.log(`  ${u.email.padEnd(22)} : ✅ tạo mới`);
  }
}

console.log("\n── 3. Gán role ──────────────────────────────────");
for (const u of USERS) {
  const { error } = await sb.from("profiles").update({ role: u.role }).eq("email", u.email);
  if (error) console.log(`  ${u.email.padEnd(22)} → ${u.role.padEnd(7)} : ❌ ${error.message}`);
  else console.log(`  ${u.email.padEnd(22)} → ${u.role.padEnd(7)} : ✅`);
}

console.log("\n── 4. Kết quả profiles ──────────────────────────");
const { data: profs } = await sb.from("profiles").select("email, role").order("role");
for (const p of profs ?? []) console.log(`  ${p.email.padEnd(22)} : ${p.role}`);

console.log("\nXong. Mật khẩu mọi tài khoản:", PASSWORD);
