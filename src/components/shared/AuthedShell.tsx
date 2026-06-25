import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ROUTES } from "@/lib/constants";
import { BuyerNavigation } from "@/components/shared/BuyerNavigation";

type Variant = "guest" | "admin";

// `ready: false` = trang thuộc phase sau, hiển thị "Sắp có" thay vì link 404.
const NAV: Record<Variant, { href: string; label: string; ready: boolean }[]> = {
  guest: [
    { href: ROUTES.dashboard, label: "Bảng điều khiển", ready: true },
    { href: ROUTES.plan, label: "Lập kế hoạch", ready: true },
  ],
  admin: [
    { href: ROUTES.admin, label: "Tổng quan", ready: true },
    { href: ROUTES.adminProducts, label: "Dịch vụ", ready: true },
    { href: ROUTES.adminBookings, label: "Booking", ready: false }, // Phase 8
  ],
};

export function AuthedShell({
  email,
  variant = "guest",
  children,
}: {
  email: string;
  variant?: Variant;
  children: ReactNode;
}) {
  if (variant === "guest") {
    return (
      <div className="flex min-h-screen flex-col">
        <BuyerNavigation email={email} />
        <main className="flex-1 bg-brand-cream pb-24 lg:pb-0">
          <Container className="py-5 sm:py-8">{children}</Container>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-black/5 bg-white">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <BrandLogo />
              <span className="hidden rounded-full bg-brand-gold-soft px-2 py-0.5 text-xs font-semibold text-brand-gold sm:inline">
                Admin
              </span>
            </div>
            <nav className="flex items-center gap-5 text-sm font-medium text-brand-muted">
              {NAV[variant].map((item) =>
                item.ready ? (
                  <Link key={item.href} href={item.href} className="hover:text-brand-ink">
                    {item.label}
                  </Link>
                ) : (
                  <span
                    key={item.href}
                    title="Sắp có ở phase tiếp theo"
                    className="flex cursor-default items-center gap-1 text-brand-muted/45"
                  >
                    {item.label}
                    <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] font-semibold">
                      Sắp có
                    </span>
                  </span>
                ),
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-brand-muted md:inline">{email}</span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-brand-ink transition-colors hover:bg-black/5"
              >
                Đăng xuất
              </button>
            </form>
          </div>
        </Container>
      </header>

      <main className="flex-1 bg-brand-cream">
        <Container className="py-8">{children}</Container>
      </main>
    </div>
  );
}
