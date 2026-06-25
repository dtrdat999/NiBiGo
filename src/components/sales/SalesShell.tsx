"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SalesNavItem = {
  href: string;
  label: string;
  shortLabel?: string;
  icon: IconName;
  ready: boolean;
};

const NAV_ITEMS: SalesNavItem[] = [
  {
    href: ROUTES.salesDashboard,
    label: "Tổng quan",
    shortLabel: "Tổng quan",
    icon: "home",
    ready: true,
  },
  {
    href: ROUTES.salesBookings,
    label: "Booking requests",
    shortLabel: "Booking",
    icon: "calendar",
    ready: true,
  },
  {
    href: ROUTES.salesOrders,
    label: "Orders",
    shortLabel: "Orders",
    icon: "ticket",
    ready: true,
  },
  {
    href: ROUTES.salesNotes,
    label: "Ghi chú khách hàng",
    shortLabel: "Ghi chú",
    icon: "list",
    ready: true,
  },
  {
    href: ROUTES.salesAiNotes,
    label: "AI Sales Notes",
    shortLabel: "AI Notes",
    icon: "sparkles",
    ready: true,
  },
];

function NavItem({
  item,
  active,
  compact = false,
}: {
  item: SalesNavItem;
  active: boolean;
  compact?: boolean;
}) {
  const content = (
    <>
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-xl",
          compact ? "h-8 w-8" : "h-9 w-9",
          active
            ? "bg-brand-green text-white"
            : item.ready
              ? "bg-white text-brand-muted"
              : "bg-white/60 text-brand-muted/40",
        )}
      >
        <Icon name={item.icon} className="h-[17px] w-[17px]" />
      </span>
      <span className={cn(compact ? "mt-1 text-[10px]" : "text-sm", "font-semibold")}>
        {compact ? item.shortLabel ?? item.label : item.label}
      </span>
      {!compact && !item.ready && (
        <span className="ml-auto rounded-full bg-brand-gold-soft px-2 py-0.5 text-[9px] font-bold text-[#9f6818]">
          Sắp làm
        </span>
      )}
    </>
  );

  if (!item.ready) {
    return (
      <span
        title="Sẽ được hoàn thiện ở mục tiếp theo"
        className={cn(
          compact
            ? "flex flex-col items-center text-brand-muted/35"
            : "flex cursor-default items-center gap-3 rounded-2xl px-3 py-2.5 text-brand-muted/50",
        )}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        compact
          ? "flex flex-col items-center"
          : "flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors",
        active
          ? compact
            ? "text-brand-green"
            : "bg-brand-green-soft text-brand-green"
          : "text-brand-muted hover:bg-white hover:text-brand-ink",
      )}
    >
      {content}
    </Link>
  );
}

export function SalesShell({
  email,
  fullName,
  role,
  children,
}: {
  email: string;
  fullName: string | null;
  role: "sales" | "admin";
  children: ReactNode;
}) {
  const pathname = usePathname();
  const displayName = fullName?.trim() || email.split("@")[0] || "Sales";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f4f6f3]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-black/[0.055] bg-[#fbfcfa] p-4 lg:flex">
        <div className="px-2 py-2">
          <BrandLogo href={ROUTES.salesDashboard} />
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-green-soft px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-green">
            <Icon name="headset" className="h-3.5 w-3.5" />
            Sales Workspace
          </div>
        </div>

        <nav className="mt-6 space-y-1" aria-label="Điều hướng Sales">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              active={
                pathname === item.href ||
                (item.href !== ROUTES.salesDashboard && pathname.startsWith(item.href))
              }
            />
          ))}
        </nav>

        <div className="mt-auto rounded-[20px] border border-black/5 bg-white p-3 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-green text-sm font-bold text-white">
              {initial}
            </span>
            <span className="min-w-0">
              <strong className="block truncate text-xs text-brand-ink">{displayName}</strong>
              <span className="mt-0.5 block truncate text-[10px] text-brand-muted">
                {role === "admin" ? "Admin hỗ trợ Sales" : "Nhân viên tư vấn"}
              </span>
            </span>
          </div>
          <form action="/auth/signout" method="post" className="mt-3">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black/5 px-3 py-2 text-xs font-semibold text-brand-muted transition-colors hover:bg-status-soldout/10 hover:text-status-soldout"
            >
              <Icon name="log-out" className="h-4 w-4" />
              Đăng xuất
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-black/[0.055] bg-white/95 backdrop-blur-xl">
          <div className="flex h-[72px] items-center gap-4 px-4 sm:px-6 lg:px-8">
            <div className="lg:hidden">
              <BrandLogo href={ROUTES.salesDashboard} compact />
            </div>

            <form action={ROUTES.salesDashboard} method="get" className="hidden max-w-md flex-1 md:block">
              <label className="relative block">
                <Icon
                  name="search"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted"
                />
                <input
                  name="q"
                  type="search"
                  placeholder="Tìm mã booking, khách hàng, số điện thoại…"
                  className="h-11 w-full rounded-2xl border border-black/[0.07] bg-brand-cream/[0.55] pl-10 pr-4 text-sm text-brand-ink outline-none transition focus:border-brand-green/30 focus:bg-white focus:ring-2 focus:ring-brand-green/10"
                />
              </label>
            </form>

            <div className="ml-auto flex items-center gap-2">
              <Link
                href={`${ROUTES.salesDashboard}?assigned=me`}
                className="hidden items-center gap-2 rounded-full border border-black/[0.07] px-4 py-2.5 text-xs font-bold text-brand-muted transition-colors hover:border-brand-green/20 hover:bg-brand-green-soft hover:text-brand-green sm:inline-flex"
              >
                <Icon name="user" className="h-4 w-4" />
                Chỉ việc của tôi
              </Link>
              <button
                type="button"
                title="Thông báo"
                className="grid h-10 w-10 place-items-center rounded-full text-brand-muted transition-colors hover:bg-brand-green-soft hover:text-brand-green"
              >
                <Icon name="bell" className="h-[18px] w-[18px]" />
              </button>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-green text-sm font-bold text-white lg:hidden">
                {initial}
              </span>
            </div>
          </div>
        </header>

        <main className="px-4 pb-24 pt-5 sm:px-6 sm:pt-7 lg:px-8 lg:pb-8">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-black/5 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(20,38,31,0.08)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              compact
              active={
                pathname === item.href ||
                (item.href !== ROUTES.salesDashboard && pathname.startsWith(item.href))
              }
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
