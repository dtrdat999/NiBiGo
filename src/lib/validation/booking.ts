import { z } from "zod";

/** Form gửi yêu cầu đặt tour. */
export const bookingSchema = z.object({
  tourPackageId: z.string().uuid(),
  contact_name: z.string().min(2, "Vui lòng nhập họ tên").max(100),
  contact_phone: z.string().min(8, "Số điện thoại không hợp lệ").max(20),
  contact_email: z.union([z.string().email("Email không hợp lệ"), z.literal("")]).optional(),
  note: z.string().max(1000).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
