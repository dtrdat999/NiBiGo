// Kiểm tra guest tạo được trip_request qua RLS (đúng luồng API dùng).
// Chạy: node scripts/check-trip.mjs
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

const { error: signErr } = await supabase.auth.signInWithPassword({
  email: "guest@nibigo.demo",
  password: "nibigo2026",
});
if (signErr) {
  console.log("❌ Không đăng nhập guest:", signErr.message);
  process.exit(1);
}

const {
  data: { user },
} = await supabase.auth.getUser();
const { data: dest } = await supabase
  .from("destinations")
  .select("id")
  .eq("slug", "ninh-binh")
  .single();

const { data: inserted, error: insErr } = await supabase
  .from("trip_requests")
  .insert({
    user_id: user.id,
    destination_id: dest.id,
    num_days: 3,
    num_nights: 2,
    num_people: 2,
    budget: 8_000_000,
    travel_style: "relaxing",
    interests: ["relaxing", "food", "photo"],
    group_composition: { adults: 2, children: 0, elderly: 0 },
    special_requests: "Test RLS — sẽ xoá",
    status: "draft",
  })
  .select("id")
  .single();

if (insErr) {
  console.log("❌ RLS chặn guest insert trip_requests:", insErr.message);
  process.exit(1);
}

console.log("✅ Guest tạo được trip_request (RLS OK) — id:", inserted.id);

await supabase.from("trip_requests").delete().eq("id", inserted.id);
console.log("   (đã xoá bản ghi test, dashboard sạch)");
