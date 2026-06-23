import "server-only";
import { getAIProvider, isAIConfigured } from "./provider";
import { REVISE_SYSTEM, buildRevisionPrompt } from "./prompts";
import { revisionSchema, type Revision } from "@/lib/validation/ai";
import type { TravelProduct } from "@/types";

/**
 * Diễn giải phản hồi tự nhiên của khách → thao tác chỉnh tour có cấu trúc.
 * Trả null nếu không có AI hoặc parse lỗi (route sẽ báo lỗi thân thiện).
 */
export async function parseRevision(
  products: TravelProduct[],
  feedback: string,
): Promise<Revision | null> {
  if (!isAIConfigured()) return null;
  try {
    const provider = getAIProvider();
    return await provider.generateJSON({
      system: REVISE_SYSTEM,
      user: buildRevisionPrompt(products, feedback),
      schema: revisionSchema,
      temperature: 0.2,
      maxTokens: 800,
    });
  } catch (err) {
    console.error("[AI] parseRevision lỗi:", err);
    return null;
  }
}
