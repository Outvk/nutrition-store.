import HomeClient from "./HomeClient";
import { getFeaturedProducts, getSaleProducts, getBrands, getCategories, getActiveSale } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0; // Disable cache for setup phase

export default async function HomePage() {
  const supabase = await createClient();
  const [featuredProducts, saleProducts, brands, categories, activeSale, settings] = await Promise.all([
    getFeaturedProducts(),
    getSaleProducts(),
    getBrands(),
    getCategories(),
    getActiveSale(),
    supabase.from("store_settings").select("landing_content").eq("id", "00000000-0000-0000-0000-000000000000").maybeSingle()
  ]);

  const landingContent = settings?.data?.landing_content;

  return (
    <HomeClient 
      featuredProducts={featuredProducts} 
      saleProducts={saleProducts} 
      brands={brands} 
      categories={categories} 
      activeSale={activeSale} 
      landingContent={landingContent}
    />
  );
}
