import { z } from "zod";
import { PRODUCT_TYPES, AVAILABILITY_STATUSES, PRICE_UNITS } from "@/lib/constants";

/** Schema input cho tạo/sửa travel_product. Dùng ở API route + form. */
export const productInputSchema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự").max(200),
  type: z.enum(PRODUCT_TYPES),
  description: z.string().max(2000).optional().nullable(),
  price: z.coerce.number().int("Giá phải là số nguyên").min(0, "Giá không âm"),
  price_unit: z.enum(PRICE_UNITS),
  duration_hours: z.coerce.number().min(0).max(48).optional().nullable(),
  tags: z.array(z.string()).default([]),
  suitable_for: z.array(z.string()).default([]),
  availability_status: z.enum(AVAILABILITY_STATUSES),
  quality_score: z.coerce.number().int().min(1).max(5),
  image_url: z.union([z.string().url("URL ảnh không hợp lệ"), z.literal(""), z.null()]).optional(),
  is_active: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productInputSchema>;

/** Bản partial cho PATCH (sửa một phần). */
export const productUpdateSchema = productInputSchema.partial();
