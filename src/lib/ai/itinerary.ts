import "server-only";
import { getAIProvider, isAIConfigured } from "./provider";
import { NIBI_SYSTEM, buildEnrichmentPrompt } from "./prompts";
import { aiResponseSchema } from "@/lib/validation/ai";
import type { BuiltPackage } from "@/lib/tour-engine/types";
import type { TripRequest, ItineraryDay } from "@/types";

/**
 * Để LLM viết name/recommendation_reason/itinerary cho 3 gói.
 * GIỮ NGUYÊN total_price, cost_breakdown, items (backend đã tính).
 * Bất kỳ lỗi nào → trả lại gói template (fallback an toàn).
 */
export async function enrichPackagesWithAI(
  packages: BuiltPackage[],
  trip: TripRequest,
  ragContext: string,
): Promise<BuiltPackage[]> {
  if (!isAIConfigured() || packages.length === 0) return packages;

  try {
    const provider = getAIProvider();
    const result = await provider.generateJSON({
      system: NIBI_SYSTEM,
      user: buildEnrichmentPrompt(packages, trip, ragContext),
      schema: aiResponseSchema,
      temperature: 0.6,
      maxTokens: 4000,
    });

    return packages.map((pkg) => {
      const ai = result.packages.find((p) => p.tier === pkg.tier);
      if (!ai) return pkg;

      // Chống bịa: chỉ giữ slot tham chiếu product_id thuộc đúng gói này.
      const validIds = new Set(pkg.items.map((it) => it.product.id));
      const itinerary: ItineraryDay[] = ai.itinerary
        .map((day) => ({
          day: day.day,
          title: day.title,
          slots: day.slots.filter((s) => validIds.has(s.product_id)),
        }))
        .filter((day) => day.slots.length > 0);

      return {
        ...pkg, // total_price, cost_breakdown, items, fit_score, tier giữ nguyên
        name: ai.name?.trim() || pkg.name,
        recommendation_reason: ai.recommendation_reason?.trim() || pkg.recommendation_reason,
        conditions: ai.conditions?.length ? ai.conditions : pkg.conditions,
        itinerary: itinerary.length ? itinerary : pkg.itinerary,
      };
    });
  } catch (err) {
    console.error("[AI] enrich thất bại — dùng itinerary template:", err);
    return packages;
  }
}
