import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { BookingStatus, OrderStatus, PaymentStatus } from "@/types";

type Tone = "neutral" | "green" | "gold" | "amber" | "red";

const toneCls: Record<Tone, string> = {
  neutral: "bg-black/5 text-brand-muted",
  green: "bg-brand-green-soft text-brand-green",
  gold: "bg-brand-gold-soft text-brand-gold",
  amber: "bg-status-limited/15 text-status-limited",
  red: "bg-status-soldout/15 text-status-soldout",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneCls[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Tone tương ứng availability_status. */
export const availabilityTone: Record<
  "available" | "limited" | "sold_out" | "need_confirmation",
  Tone
> = {
  available: "green",
  limited: "amber",
  sold_out: "red",
  need_confirmation: "gold",
};

/** Tone tương ứng booking_status (dùng chung dashboard + confirmation). */
export const bookingStatusTone: Record<BookingStatus, Tone> = {
  new: "amber",
  contacted: "green",
  checking_availability: "amber",
  waiting_payment: "gold",
  confirmed: "green",
  completed: "green",
  cancelled: "red",
};

/** Tone tương ứng order_status. */
export const orderStatusTone: Record<OrderStatus, Tone> = {
  pending_confirmation: "amber",
  awaiting_payment: "gold",
  paid: "green",
  processing: "amber",
  confirmed: "green",
  completed: "green",
  cancelled: "red",
  refund_requested: "gold",
  refunded: "neutral",
};

/** Tone tương ứng payment_status. */
export const paymentStatusTone: Record<PaymentStatus, Tone> = {
  unpaid: "neutral",
  pending: "amber",
  paid_demo: "green",
  refunded: "neutral",
};
