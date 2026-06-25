import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { AuthedShell } from "@/components/shared/AuthedShell";

export default async function GuestLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "sales") redirect("/sales/dashboard");
  if (profile?.role === "admin") redirect("/admin");

  return (
    <AuthedShell email={user.email ?? ""} variant="guest">
      {children}
    </AuthedShell>
  );
}
