import { z } from "zod";

export const salesNoteTypeSchema = z.enum([
  "contact_attempt",
  "customer_preference",
  "price_discussion",
  "partner_confirmation",
  "risk_warning",
  "follow_up",
  "general",
]);

export const addSalesNoteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(3, "Ghi chú cần có ít nhất 3 ký tự")
    .max(2000, "Ghi chú không được vượt quá 2.000 ký tự"),
  noteType: salesNoteTypeSchema.default("general"),
});

export const salesStatusTransitionSchema = z.object({
  toStatus: z.enum([
    "contacted",
    "checking_availability",
    "waiting_payment",
    "cancelled",
  ]),
  note: z
    .string()
    .trim()
    .min(5, "Vui lòng ghi rõ kết quả xử lý")
    .max(2000, "Nội dung không được vượt quá 2.000 ký tự"),
});

const availabilityNote = z
  .string()
  .trim()
  .max(2000, "Ghi chú không được vượt quá 2.000 ký tự")
  .optional();

export const replaceServiceSchema = z.object({
  itemId: z.string().uuid(),
  newProductId: z.string().uuid(),
  reason: z
    .string()
    .trim()
    .min(5, "Vui lòng ghi rõ lý do thay thế dịch vụ")
    .max(2000, "Nội dung không được vượt quá 2.000 ký tự"),
});

export const salesContactSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create_followup"),
    dueAt: z.string().datetime({ message: "Thời điểm follow-up không hợp lệ" }),
    content: z
      .string()
      .trim()
      .min(3, "Nội dung follow-up cần ít nhất 3 ký tự")
      .max(2000, "Nội dung không được vượt quá 2.000 ký tự"),
    followUpType: z.enum([
      "call_attempt",
      "zalo_message",
      "email_sent",
      "callback_requested",
      "price_discussion",
      "itinerary_discussion",
      "waiting_partner",
    ]),
  }),
  z.object({
    action: z.literal("complete_followup"),
    followupId: z.string().uuid(),
    resultNote: z
      .string()
      .trim()
      .min(3, "Cần ghi kết quả liên hệ")
      .max(2000, "Nội dung không được vượt quá 2.000 ký tự"),
  }),
  z.object({
    action: z.literal("cancel_followup"),
    followupId: z.string().uuid(),
    reason: z.string().trim().max(2000).optional(),
  }),
  z.object({
    action: z.literal("set_contact_status"),
    status: z.enum([
      "not_contacted",
      "contacted",
      "no_response",
      "interested",
      "negotiating",
      "confirmed",
      "lost",
    ]),
    note: z.string().trim().max(2000).optional(),
  }),
]);

export const salesAvailabilitySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update_service"),
    category: z.enum(["accommodation", "transport", "activity", "restaurant"]),
    status: z.enum(["pending", "available", "limited", "not_available", "replaced"]),
    note: availabilityNote,
  }),
  z.object({
    action: z.literal("set_final_price"),
    finalPrice: z.coerce
      .number()
      .int("Giá cuối phải là số nguyên")
      .positive("Giá cuối phải lớn hơn 0"),
    note: z
      .string()
      .trim()
      .min(5, "Vui lòng ghi rõ lý do/cơ sở của giá cuối")
      .max(2000, "Nội dung không được vượt quá 2.000 ký tự"),
  }),
  z.object({
    action: z.literal("set_agreement"),
    agreed: z.boolean(),
  }),
]);
