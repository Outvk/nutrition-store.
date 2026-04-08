import DashboardClient from "./DashboardClient";
import { getDashboardStats, getAllOrders, getLowStock } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { Order } from "@/types";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch reset timestamp from store_settings
  const fixedId = "00000000-0000-0000-0000-000000000000";
  const { data: settings } = await supabase
    .from("store_settings")
    .select("revenue_reset_at")
    .eq("id", fixedId)
    .single();

  const revenueResetAt: string | null = settings?.revenue_reset_at ?? null;

  const stats = await getDashboardStats();
  const orders = await getAllOrders();
  const recentOrders = orders.slice(0, 5);

  const lowStock = await getLowStock();

  const { count: activeProductsCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  return (
    <DashboardClient
      stats={stats}
      allOrders={orders as Order[]}
      recentOrders={recentOrders as Order[]}
      lowStock={lowStock || []}
      activeProductsCount={activeProductsCount || 0}
      revenueResetAt={revenueResetAt}
    />
  );
}
