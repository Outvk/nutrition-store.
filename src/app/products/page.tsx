import ProductsClient from "./ProductsClient";
import { getProducts, getBrands, getCategories } from "@/lib/supabase/queries";

export const revalidate = 300; // 5 mins cache

export default async function ProductsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const pbSearch = await searchParams;
  const brand = typeof pbSearch.brand === 'string' ? pbSearch.brand : undefined;
  const category = typeof pbSearch.category === 'string' ? pbSearch.category : undefined;
  const sale = pbSearch.sale === 'true';
  const page = typeof pbSearch.page === 'string' ? parseInt(pbSearch.page, 10) : 0;

  const [productsData, brands, categories] = await Promise.all([
    getProducts(page, { brand_id: brand, category_id: category, is_on_sale: sale ? true : undefined }),
    getBrands(),
    getCategories()
  ]);

  return <ProductsClient 
    initialProducts={productsData.products as any} 
    total={productsData.total} 
    brands={brands as any} 
    categories={categories as any} 
  />;
}
