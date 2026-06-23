import "server-only";
import OpenAI from "openai";
import type { ZodType } from "zod";

/**
 * Lớp trừu tượng AI — đổi OpenAI ↔ Gemini dễ dàng.
 * Mọi lời gọi LLM chạy server-side; key không lộ client.
 */
export interface AIProvider {
  generateJSON<T>(args: {
    system: string;
    user: string;
    schema: ZodType<T>;
    temperature?: number;
    maxTokens?: number;
  }): Promise<T>;
  generateText(args: { system: string; user: string; temperature?: number }): Promise<string>;
}

const MODEL = process.env.AI_MODEL || "gpt-4o-mini";

function client() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const openaiProvider: AIProvider = {
  async generateJSON({ system, user, schema, temperature = 0.6, maxTokens = 4000 }) {
    const res = await client().chat.completions.create({
      model: MODEL,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    const text = res.choices[0]?.message?.content ?? "{}";
    return schema.parse(JSON.parse(text));
  },

  async generateText({ system, user, temperature = 0.6 }) {
    const res = await client().chat.completions.create({
      model: MODEL,
      temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    return res.choices[0]?.message?.content ?? "";
  },
};

export function getAIProvider(): AIProvider {
  // Phase 6: OpenAI. Có thể thêm Gemini adapter sau cùng interface này.
  return openaiProvider;
}

/** Có cấu hình AI không (để fallback template khi thiếu key). */
export function isAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}
