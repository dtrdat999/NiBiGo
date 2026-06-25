import { z } from "zod";

/** Form gửi yêu cầu đặt tour. */
export const bookingSchema = z.object({
  tourPackageId: z.string().uuid(),
  contact_name: z.string().min(2, "Vui lòng nhập họ tên").max(100),
  contact_phone: z
    .string()
    .trim()
    .regex(/^[+()\d\s.-]{8,20}$/, "Số điện thoại không hợp lệ"),
  contact_email: z.union([z.string().email("Email không hợp lệ"), z.literal("")]).optional(),
  preferred_contact_channel: z.enum(["phone", "zalo", "email"]).default("phone"),
  special_request: z.string().max(700).optional(),
  note: z.string().max(1000).optional(),
  confirmation: z.literal(true, {
    errorMap: () => ({ message: "Vui lòng xác nhận điều kiện trước khi gửi" }),
  }),
});

export type BookingInput = z.infer<typeof bookingSchema>;
