import Link from "next/link";
import type { ReactNode } from "react";
import { APP_NAME, ENGINE_NAME, ROUTES } from "@/lib/constants";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-green-soft/50 to-brand-cream px-4 py-12">
      <div className="w-full max-w-md">
        <Link href={ROUTES.home} className="mb-8 flex items-center justify-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-green text-sm font-bold text-white">
            Ni
          </span>
          <span className="text-base font-bold text-brand-ink">{APP_NAME}</span>
        </Link>

        <div className="rounded-2xl border border-black/5 bg-white p-7 shadow-card">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-brand-muted">
          Được hỗ trợ bởi {ENGINE_NAME} · Du lịch Ninh Bình
        </p>
      </div>
    </div>
  );
}
