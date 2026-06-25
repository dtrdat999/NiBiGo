import { z } from "zod";

export const checkoutSchema = z.object({
  note: z.string().trim().max(2000, "Ghi chú không được vượt quá 2.000 ký tự").optional(),
});

export const orderTransitionSchema = z.object({
  toStatus: z.enum([
    "awaiting_payment",
    "processing",
    "confirmed",
    "completed",
    "cancelled",
    "refund_requested",
    "refunded",
  ]),
  note: z
    .string()
    .trim()
    .min(5, "Vui lòng ghi rõ kết quả/lý do")
    .max(2000, "Nội dung không được vượt quá 2.000 ký tự"),
});
