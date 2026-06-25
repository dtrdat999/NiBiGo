"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  ready: boolean;
};

const desktopNav: NavItem[] = [
  { href: ROUTES.dashboard, label: "Tổng quan", icon: "home", ready: true },
  { href: ROUTES.explore, label: "Khám phá", icon: "compass", ready: true },
  { href: ROUTES.plan, label: "Lập kế hoạch", icon: "sparkles", ready: true },
  { href: ROUTES.bookings, label: "Yêu cầu", icon: "calendar", ready: true },
  { href: ROUTES.orders, label: "Đơn hàng", icon: "ticket", ready: true },
];

const mobileNav: NavItem[] = [
  { href: ROUTES.dashboard, label: "Trang chủ", icon: "home", ready: true },
  { href: ROUTES.explore, label: "Khám phá", icon: "compass", ready: true },
  { href: ROUTES.plan, label: "NiBi AI", icon: "sparkles", ready: true },
  { href: ROUTES.bookings, label: "Yêu cầu", icon: "calendar", ready: true },
  { href: ROUTES.orders, label: "Đơn", icon: "ticket", ready: true },
];

function DesktopItem({ item, active }: { item: NavItem; active: boolean }) {
  if (!item.ready) {
    return (
      <span
        title="Sẽ được xây dựng ở mục tiếp theo"
        className="relative inline-flex cursor-default items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-brand-muted/50"
      >
        <Icon name={item.icon} className="h-4 w-4" />
        {item.label}
        <span className="h-1.5 w-1.5 rounded-full bg-brand-gold/70" aria-label="Sắp có" />
      </span>
    );
  }

  const isPlanner = item.href === ROUTES.plan;

  return (
    <Link
      href={item.href}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
        active && !isPlanner && "bg-white text-brand-green shadow-sm",
        !active && !isPlanner && "text-brand-muted hover:bg-white/70 hover:text-brand-ink",
        isPlanner &&
          (active
            ? "bg-brand-green text-white shadow-sm"
            : "text-brand-green hover:bg-white/75"),
      )}
    >
      <Icon name={item.icon} className="h-4 w-4" />
      {item.label}
    </Link>
  );
}

export function BuyerNavigation({ email }: { email: string }) {
  const pathname = usePathname();
  const accountName = email.split("@")[0] || "Buyer";
  const displayName = accountName.charAt(0).toUpperCase() + accountName.slice(1);
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/[0.045] bg-white/95 backdrop-blur-xl">
        <Container className="flex h-[76px] items-center justify-between gap-5">
          <BrandLogo href={ROUTES.dashboard} />

          <nav
            className="hidden items-center gap-1 rounded-full border border-black/[0.035] bg-brand-cream/75 p-1 lg:flex"
            aria-label="Điều hướng Buyer"
          >
            {desktopNav.map((item) => (
              <DesktopItem
                key={item.href}
                item={item}
                active={
                  item.ready &&
                  (pathname === item.href ||
                    (item.href === ROUTES.explore && pathname.startsWith(ROUTES.products)) ||
                    (item.href === ROUTES.bookings &&
                      pathname.startsWith(ROUTES.bookings)) ||
                    (item.href === ROUTES.orders && pathname.startsWith(ROUTES.orders)))
                }
              />
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href={ROUTES.products}
              title="Tìm kiếm dịch vụ"
              className="hidden h-10 w-10 place-items-center rounded-full text-brand-muted transition hover:bg-brand-cream hover:text-brand-green md:grid"
            >
              <Icon name="search" className="h-[18px] w-[18px]" />
              <span className="sr-only">Tìm kiếm</span>
            </Link>
            <Link
              href={ROUTES.cart}
              title="Giỏ dịch vụ"
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full transition",
                pathname === ROUTES.cart
                  ? "bg-brand-green-soft text-brand-green"
                  : "text-brand-muted hover:bg-brand-cream hover:text-brand-green",
              )}
            >
              <Icon name="ticket" className="h-[18px] w-[18px]" />
              <span className="sr-only">Giỏ dịch vụ</span>
            </Link>
            <button
              type="button"
              title="Thông báo"
              className="hidden h-10 w-10 place-items-center rounded-full text-brand-muted transition hover:bg-brand-cream hover:text-brand-green md:grid"
            >
              <Icon name="bell" className="h-[18px] w-[18px]" />
              <span className="sr-only">Thông báo</span>
            </button>

            <div className="mx-1 hidden h-7 w-px bg-black/[0.07] md:block" />

            <div className="flex items-center gap-2 rounded-full border border-black/[0.055] bg-white p-1 pr-2.5 shadow-[0_4px_14px_rgba(20,38,31,.045)]">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-green text-sm font-bold text-white">
                {initial}
              </span>
              <span className="hidden min-w-0 leading-tight md:block">
                <span className="block max-w-24 truncate text-xs font-bold text-brand-ink">
                  {displayName}
                </span>
                <span className="mt-0.5 block text-[9px] font-medium text-brand-muted">
                  Tài khoản Buyer
                </span>
              </span>
            </div>

            <form action="/auth/signout" method="post">
              <button
                type="submit"
                title="Đăng xuất"
                className="grid h-10 w-10 place-items-center rounded-full text-brand-muted transition hover:bg-status-soldout/10 hover:text-status-soldout"
              >
                <Icon name="log-out" className="h-[18px] w-[18px]" />
                <span className="sr-only">Đăng xuất</span>
              </button>
            </form>
          </div>
        </Container>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-black/5 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(20,38,31,0.08)] backdrop-blur-xl lg:hidden"
        aria-label="Điều hướng Buyer trên di động"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {mobileNav.map((item) => {
            const active =
              item.ready &&
              (pathname === item.href ||
                (item.href === ROUTES.explore && pathname.startsWith(ROUTES.products)) ||
                (item.href === ROUTES.bookings && pathname.startsWith(ROUTES.bookings)) ||
                (item.href === ROUTES.orders && pathname.startsWith(ROUTES.orders)));
            const content = (
              <>
                <span
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-xl transition-colors",
                    item.href === ROUTES.plan
                      ? "bg-brand-green text-white shadow-sm"
                      : active
                        ? "bg-brand-green-soft text-brand-green"
                        : "text-brand-muted",
                  )}
                >
                  <Icon name={item.icon} className="h-[18px] w-[18px]" />
                </span>
                <span className="mt-1 text-[10px] font-semibold">{item.label}</span>
              </>
            );

            return item.ready ? (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center text-brand-muted",
                  active && "text-brand-green",
                )}
              >
                {content}
              </Link>
            ) : (
              <span
                key={item.href}
                title="Sắp có"
                className="flex cursor-default flex-col items-center text-brand-muted/35"
              >
                {content}
              </span>
            );
          })}
        </div>
      </nav>
    </>
  );
}
