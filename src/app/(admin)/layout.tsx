import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { AuthedShell } from "@/components/shared/AuthedShell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Defense-in-depth: chặn không phải admin ngay ở server (kèm middleware + RLS).
  if (profile?.role === "sales") redirect("/sales/dashboard");
  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <AuthedShell email={user.email ?? ""} variant="admin">
      {children}
    </AuthedShell>
  );
}
