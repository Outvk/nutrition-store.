import { getProducts, getBrands, getCategories } from "@/lib/supabase/queries";
import PacksClient from "./PacksClient";

export const revalidate = 300; // 5 mins cache

export default async function PacksPage() {
  const categories = await getCategories();
  const packsCategory = categories.find(c => c.name.toLowerCase().includes("pack"));
  
  const productsData = packsCategory 
    ? await getProducts(0, { category_id: packsCategory.id }, 100)
    : { products: [], total: 0 };

  return <PacksClient products={productsData.products} />;
}
