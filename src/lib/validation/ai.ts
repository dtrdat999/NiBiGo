import { z } from "zod";
import { PACKAGE_TIERS, PRODUCT_TYPES } from "@/lib/constants";

/** Schema output LLM khi viết itinerary/lý do (AI_DESIGN §7.2). */
export const aiSlotSchema = z.object({
  time: z.enum(["morning", "noon", "afternoon", "evening"]),
  product_id: z.string(),
  description: z.string(),
});

export const aiDaySchema = z.object({
  day: z.number(),
  title: z.string(),
  slots: z.array(aiSlotSchema),
});

export const aiPackageSchema = z.object({
  tier: z.enum(PACKAGE_TIERS),
  name: z.string(),
  recommendation_reason: z.string(),
  conditions: z.array(z.string()).default([]),
  itinerary: z.array(aiDaySchema),
});

export const aiResponseSchema = z.object({
  packages: z.array(aiPackageSchema),
});

export type AIResponse = z.infer<typeof aiResponseSchema>;

/** Thao tác chỉnh tour do LLM diễn giải (AI_DESIGN §7.3). */
export const revisionOpSchema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("remove"), product_id: z.string() }),
  z.object({
    op: z.literal("add_like"),
    tags: z.array(z.string()),
    avoid_tags: z.array(z.string()).optional(),
    product_type: z.enum(PRODUCT_TYPES).optional(),
  }),
  z.object({ op: z.literal("replace"), product_id: z.string(), tags: z.array(z.string()) }),
  z.object({ op: z.literal("set_intensity"), level: z.enum(["lighter", "heavier"]) }),
  z.object({ op: z.literal("adjust_budget"), direction: z.enum(["down", "up"]) }),
]);

export const revisionSchema = z.object({
  intent_summary: z.string(),
  operations: z.array(revisionOpSchema),
});

export type Revision = z.infer<typeof revisionSchema>;
