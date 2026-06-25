import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ENGINE_NAME } from "@/lib/constants";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-green-soft/50 to-brand-cream px-4 py-12">
      <div className="w-full max-w-md">
        <BrandLogo className="mb-8 justify-center" />

        <div className="rounded-2xl border border-black/5 bg-white p-7 shadow-card">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-brand-muted">
          Trợ lý du lịch {ENGINE_NAME} · Ninh Bình
        </p>
      </div>
    </div>
  );
}
