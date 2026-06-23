// Kiểm tra nhanh kết nối Supabase + dữ liệu seed.
// Chạy: node scripts/check-db.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = {};
try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
} catch {
  console.error("❌ Không đọc được .env.local");
  process.exit(1);
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("❌ Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

try {
  const { count: products, error: e1 } = await supabase
    .from("travel_products")
    .select("*", { count: "exact", head: true });
  if (e1) throw e1;

  const { data: dest } = await supabase
    .from("destinations")
    .select("name")
    .eq("slug", "ninh-binh")
    .maybeSingle();

  const { count: docs } = await supabase
    .from("knowledge_documents")
    .select("*", { count: "exact", head: true });

  const { data: admins } = await supabase.from("profiles").select("email").eq("role", "admin");

  console.log("✅ Kết nối Supabase OK\n");
  console.log("  Điểm đến Ninh Bình :", dest?.name ?? "❌ chưa có (chạy seed.sql)");
  console.log("  travel_products    :", products ?? 0, products ? "✅" : "❌ (chạy seed.sql)");
  console.log("  knowledge_documents:", docs ?? 0);
  console.log(
    "  Admin              :",
    admins && admins.length ? admins.map((a) => a.email).join(", ") + " ✅" : "❌ chưa có (đăng ký + chạy promote)",
  );
} catch (err) {
  console.error("❌ Lỗi truy vấn — có thể chưa chạy migrations 0001/0002.\n  ", err.message);
  process.exit(1);
}
