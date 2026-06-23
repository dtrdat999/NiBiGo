"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError } from "@/lib/auth-errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ROUTES } from "@/lib/constants";

export function RegisterForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
      },
    });

    if (signUpError) {
      setError(mapAuthError(signUpError.message));
      setLoading(false);
      return;
    }

    // Nếu đã bật phiên (tắt confirm email) → vào thẳng dashboard.
    if (data.session) {
      router.push(ROUTES.dashboard);
      router.refresh();
      return;
    }

    // Ngược lại: cần xác nhận email.
    setCheckEmail(true);
    setLoading(false);
  }

  if (checkEmail) {
    return (
      <div className="space-y-3 text-center">
        <div className="text-3xl">📩</div>
        <h2 className="text-lg font-bold text-brand-ink">Kiểm tra email của bạn</h2>
        <p className="text-sm text-brand-muted">
          Chúng tôi đã gửi liên kết xác nhận tới <span className="font-medium">{email}</span>.
          Mở email để kích hoạt tài khoản rồi đăng nhập.
        </p>
        <Link href={ROUTES.login} className="inline-block text-sm font-semibold text-brand-green hover:underline">
          Về trang đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="full_name" className="text-sm font-medium text-brand-ink">
          Họ và tên
        </label>
        <Input
          id="full_name"
          type="text"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nguyễn Văn A"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-brand-ink">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ban@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-brand-ink">
          Mật khẩu
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ít nhất 6 ký tự"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-status-soldout/10 px-3 py-2 text-sm text-status-soldout">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
      </Button>

      <p className="text-center text-sm text-brand-muted">
        Đã có tài khoản?{" "}
        <Link href={ROUTES.login} className="font-semibold text-brand-green hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
