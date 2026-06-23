import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProductsManager } from "@/components/admin/ProductsManager";
import type { TravelProduct } from "@/types";

export const metadata: Metadata = { title: "Quản lý dịch vụ — NiBiGo AI Travel Platform" };
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Quản lý dịch vụ</h1>
        <p className="mt-1 text-brand-muted">
          Kho dịch vụ du lịch Ninh Bình — nguồn dữ liệu để AI dựng tour.
        </p>
      </div>
      <ProductsManager products={(data as TravelProduct[] | null) ?? []} />
    </div>
  );
}
