import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Đăng nhập — NiBiGo AI Travel Platform" };

export default function LoginPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-brand-ink">Chào mừng trở lại</h1>
        <p className="mt-1 text-sm text-brand-muted">Đăng nhập để tiếp tục lập kế hoạch.</p>
      </div>
      <Suspense fallback={<div className="h-64" />}>
        <LoginForm />
      </Suspense>
    </>
  );
}
