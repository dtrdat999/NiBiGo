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

  return (
    <AuthedShell email={user.email ?? ""} variant="guest">
      {children}
    </AuthedShell>
  );
}
