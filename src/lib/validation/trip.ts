import { z } from "zod";
import { TRAVEL_STYLES } from "@/lib/constants";

/** Input form nhu cầu chuyến đi. num_people + num_nights tính ở server. */
export const tripRequestSchema = z.object({
  num_days: z.coerce.number().int().min(1, "Tối thiểu 1 ngày").max(14, "Tối đa 14 ngày"),
  start_date: z.string().optional().nullable(),
  adults: z.coerce.number().int().min(1, "Cần ít nhất 1 người lớn").max(30),
  children: z.coerce.number().int().min(0).max(20),
  elderly: z.coerce.number().int().min(0).max(20),
  budget: z.coerce.number().int().min(500_000, "Ngân sách tối thiểu 500.000đ"),
  travel_style: z.enum(TRAVEL_STYLES),
  interests: z.array(z.string()).default([]),
  special_requests: z.string().max(1000).optional().nullable(),
});

export type TripRequestInput = z.infer<typeof tripRequestSchema>;
