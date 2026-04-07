import ProductDetailClient from "./ProductDetailClient";
import { getProductById, getProducts } from "@/lib/supabase/queries";
import { notFound } from "next/navigation";

export const revalidate = 300; // 5 mins cache

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await getProductById(id);
  if (!product) {
    return notFound();
  }

  // Fetch related products from same category
  const relatedData = await getProducts(0, { category_id: product.category_id });
  // Filter out the current product and take 4
  const related = relatedData.products.filter(p => p.id !== product.id).slice(0, 4);

  return <ProductDetailClient product={product} relatedProducts={related as any} />;
}
