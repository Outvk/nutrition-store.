import OrdersClient from "./OrdersClient";
import { getAllOrders } from "@/lib/supabase/queries";

export const revalidate = 0;

export default async function OrdersPage() {
  const orders = await getAllOrders();
  return <OrdersClient initialOrders={orders} />;
}
