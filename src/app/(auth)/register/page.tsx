import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Đăng ký — NiBiGo AI Travel Platform" };

export default function RegisterPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-brand-ink">Tạo tài khoản</h1>
        <p className="mt-1 text-sm text-brand-muted">Bắt đầu tạo tour Ninh Bình của riêng bạn.</p>
      </div>
      <RegisterForm />
    </>
  );
}
