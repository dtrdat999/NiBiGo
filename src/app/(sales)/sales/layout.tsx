import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { SalesShell } from "@/components/sales/SalesShell";

export default async function SalesLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/sales/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "sales" && profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <SalesShell
      email={user.email ?? ""}
      fullName={profile.full_name}
      role={profile.role}
    >
      {children}
    </SalesShell>
  );
}
