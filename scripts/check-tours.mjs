// Kiểm tra tính toàn vẹn giá của tour_packages đã sinh:
// total_price PHẢI bằng tổng line_total các item (backend tính, không phải LLM).
// Chạy sau khi đã tạo trip + xem trang proposals trong trình duyệt.
// Chạy: node scripts/check-tours.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: packages } = await supabase
  .from("tour_packages")
  .select("id, tier, name, total_price, fit_score, trip_request_id")
  .order("trip_request_id")
  .order("total_price");

if (!packages || packages.length === 0) {
  console.log("ℹ️  Chưa có gói tour nào. Hãy đăng nhập guest → /plan → tạo yêu cầu → xem proposals trước.");
  process.exit(0);
}

let allOk = true;
for (const pkg of packages) {
  const { data: items } = await supabase
    .from("tour_package_items")
    .select("line_total")
    .eq("tour_package_id", pkg.id);
  const sum = (items ?? []).reduce((s, i) => s + i.line_total, 0);
  const ok = sum === pkg.total_price;
  if (!ok) allOk = false;
  console.log(
    `${ok ? "✅" : "❌"} [${pkg.tier.padEnd(8)}] ${pkg.name} — total=${pkg.total_price.toLocaleString("vi-VN")} | Σitems=${sum.toLocaleString("vi-VN")} | fit=${pkg.fit_score}`,
  );
}

console.log(
  allOk
    ? "\n✅ Giá khớp 100% với DB (backend tính tiền — đúng nguyên tắc)."
    : "\n❌ Có gói lệch giá — kiểm tra pricing.ts.",
);
process.exit(allOk ? 0 : 1);
