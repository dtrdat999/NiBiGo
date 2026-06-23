import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-brand-ink",
        "placeholder:text-brand-muted/60 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20",
        "disabled:opacity-60",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
