import "server-only";
import { getAIProvider, isAIConfigured } from "./provider";
import { NIBI_SYSTEM, buildEnrichmentPrompt } from "./prompts";
import { aiResponseSchema } from "@/lib/validation/ai";
import { normalizeItineraryDays } from "@/lib/itinerary/structure";
import { sanitizeBookingPolicyCopy } from "@/lib/product-policy";
import type { BuiltPackage } from "@/lib/tour-engine/types";
import type { ItineraryDay, TripRequest } from "@/types";

/**
 * Để LLM viết name/recommendation_reason/itinerary cho các gói.
 * Giá, cost breakdown và items luôn giữ nguyên từ engine.
 */
export async function enrichPackagesWithAI(
  packages: BuiltPackage[],
  trip: TripRequest,
  ragContext: string,
): Promise<BuiltPackage[]> {
  const safeFallback = packages.map((pkg) => ({
    ...pkg,
    name: sanitizeBookingPolicyCopy(pkg.name),
    recommendation_reason: sanitizeBookingPolicyCopy(pkg.recommendation_reason),
    conditions: pkg.conditions.map((condition) => sanitizeBookingPolicyCopy(condition)),
    itinerary: normalizeItineraryDays(pkg.itinerary, trip.num_days),
  }));

  if (!isAIConfigured() || packages.length === 0) return safeFallback;

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
      const ai = result.packages.find((item) => item.tier === pkg.tier);
      if (!ai) {
        return {
          ...pkg,
          itinerary: normalizeItineraryDays(pkg.itinerary, trip.num_days),
        };
      }

      const validIds = new Set(pkg.items.map((item) => item.product.id));
      const itinerary: ItineraryDay[] = ai.itinerary
        .map((day) => ({
          day: day.day,
          title: sanitizeBookingPolicyCopy(day.title),
          slots: day.slots
            .filter((slot) => validIds.has(slot.product_id))
            .map((slot) => ({
              ...slot,
              description: sanitizeBookingPolicyCopy(slot.description),
            })),
        }))
        .filter((day) => day.slots.length > 0);

      return {
        ...pkg,
        name: sanitizeBookingPolicyCopy(ai.name?.trim()) || pkg.name,
        recommendation_reason:
          sanitizeBookingPolicyCopy(ai.recommendation_reason?.trim()) ||
          pkg.recommendation_reason,
        conditions: (ai.conditions?.length ? ai.conditions : pkg.conditions).map((condition) =>
          sanitizeBookingPolicyCopy(condition),
        ),
        itinerary: normalizeItineraryDays(
          itinerary.length ? itinerary : pkg.itinerary,
          trip.num_days,
        ),
      };
    });
  } catch (err) {
    console.error("[AI] enrich failed, using safe itinerary template:", err);
    return safeFallback;
  }
}
