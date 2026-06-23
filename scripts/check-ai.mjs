// Kiểm tra OPENAI_API_KEY + model + JSON mode hoạt động.
// Chạy: node scripts/check-ai.mjs
import OpenAI from "openai";
import { readFileSync } from "node:fs";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

if (!env.OPENAI_API_KEY) {
  console.log("❌ Thiếu OPENAI_API_KEY trong .env.local (app sẽ fallback itinerary template).");
  process.exit(1);
}

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
const model = env.AI_MODEL || "gpt-4o-mini";

try {
  const res = await client.chat.completions.create({
    model,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Bạn trả về JSON hợp lệ." },
      { role: "user", content: 'Trả về JSON dạng {"ok": true, "diem_den": "Ninh Bình"}.' },
    ],
  });
  console.log(`✅ OpenAI OK — model: ${model}`);
  console.log("   Phản hồi:", res.choices[0]?.message?.content);
  console.log("   Tokens:", res.usage?.total_tokens);
} catch (e) {
  console.log(`❌ OpenAI lỗi (${e.status ?? "?"}): ${e.message}`);
  console.log("   → App vẫn chạy được nhờ fallback itinerary template.");
  process.exit(1);
}
