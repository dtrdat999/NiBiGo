import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-black/5 bg-white p-6 shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}
