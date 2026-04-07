import InventoryClient from "./InventoryClient";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: variants } = await supabase
    .from('variants')
    .select('variantId:id, flavor, size, stock, products!inner(id, name)')
    .order('stock', { ascending: true });

  const properlyFormatted = (variants || []).map((v: any) => ({
    productId: v.products.id,
    productName: v.products.name,
    variantId: v.variantId,
    flavor: v.flavor,
    size: v.size,
    stock: v.stock
  }));

  return <InventoryClient initialVariants={properlyFormatted} />;
}
