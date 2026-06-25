import Image from "next/image";
import Link from "next/link";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BrandLogo({
  href = ROUTES.home,
  compact = false,
  className,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("flex shrink-0 items-center gap-3", className)}
      aria-label={APP_NAME}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-green-soft p-1.5 shadow-[0_7px_18px_rgba(32,104,76,.12)]">
        <Image
          src="/assets/brand/logo/logo_nibigo-2.png"
          alt=""
          width={44}
          height={44}
          className="h-full w-full object-contain"
          priority
        />
      </span>
      {!compact && (
        <span className="hidden leading-none sm:block">
          <span className="block text-[19px] font-bold tracking-[-0.025em] text-brand-ink">
            NiBiGo
          </span>
          <span className="mt-1.5 block text-[9px] font-semibold uppercase tracking-[0.2em] text-brand-muted">
            Ninh Bình · AI Travel
          </span>
        </span>
      )}
    </Link>
  );
}
