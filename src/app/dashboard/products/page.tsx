import { createClient } from '@/lib/supabase/server';
import ProductsDashboardClient from './ProductsDashboardClient';

export const revalidate = 0;

export default async function ProductsDashboardPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: brands }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*, variants(*)').order('created_at', { ascending: false }),
    supabase.from('brands').select('*'),
    supabase.from('categories').select('*'),
  ]);

  return (
    <ProductsDashboardClient 
      initialProducts={products || []} 
      brands={brands || []} 
      categories={categories || []} 
    />
  );
}
