import { createClient } from './server'
import { Product, Brand, Category, OrderInsert, OrderItemInsert, DashboardStats, LowStockItem } from '@/types'
import { AppError, StockError, NotFoundError } from '../errors'

export async function getProducts(page = 0, filters: { brand_id?: string, category_id?: string, is_on_sale?: boolean } = {}, limit?: number): Promise<{ products: Product[], total: number }> {
  const supabase = await createClient()
  const PAGE_SIZE = limit || 12
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('products')
    .select('*, brand:brand_id(*), category:category_id(*)', { count: 'exact' })
    .eq('is_active', true)

  if (filters.brand_id) query = query.eq('brand_id', filters.brand_id)
  if (filters.category_id) query = query.eq('category_id', filters.category_id)
  if (filters.is_on_sale !== undefined) query = query.eq('is_on_sale', filters.is_on_sale)

  const { data, count, error } = await query.range(from, to).order('created_at', { ascending: false })
  if (error) throw new AppError('InternalError', `Échec du chargement des produits: ${error.message}`, 500)
  return { products: (data as Product[]) || [], total: count || 0 }
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, variants(*), brand:brand_id(*), category:category_id(*)')
    .eq('id', id)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new AppError('InternalError', `Échec du chargement du produit ${id}: ${error.message}`, 500)
  }
  return data as Product | null
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, sale_price, images, is_on_sale, brand_id, category_id, is_active')
    .eq('is_active', true)
    .limit(4)
  if (error) throw new AppError('InternalError', `Fetch featured products failed: ${error.message}`, 500)
  return (data as Product[]) || []
}

export async function getSaleProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, sale_price, images, is_on_sale, brand_id, category_id, is_active')
    .eq('is_on_sale', true)
    .eq('is_active', true)
  if (error) throw new AppError('InternalError', `Fetch sale products failed: ${error.message}`, 500)
  return (data as Product[]) || []
}

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('brands')
    .select('id, name, logo_url')
    .eq('is_visible', true)
  if (error) throw new AppError('InternalError', `Fetch brands failed: ${error.message}`, 500)
  return (data as Brand[]) || []
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, image_url')
  if (error) throw new AppError('InternalError', `Fetch categories failed: ${error.message}`, 500)
  return (data as Category[]) || []
}

export async function getActiveSale() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sale_events')
    .select('id, label, starts_at, ends_at')
    .eq('is_active', true)
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') console.error('getActiveSale error:', error) // PGRST116 is no rows
  return data
}

export async function getAllOrders() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items (
        *,
        products (name),
        variants (flavor, size)
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw new AppError('InternalError', `Fetch orders failed: ${error.message}`, 500)
  return data || []
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_dashboard_stats')
  if (error) throw new AppError('InternalError', `Échec du chargement des statistiques: ${error.message}`, 500)
  return data as DashboardStats | null
}

export async function getLowStock(threshold = 5): Promise<LowStockItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_low_stock', { threshold })
  if (error) console.error('getLowStock error:', error)
  return (data as LowStockItem[]) || []
}

export async function insertOrder(orderData: OrderInsert, items: OrderItemInsert[]) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('place_order', {
    p_order_data: orderData,
    p_items: items
  })

  if (error) {
    if (error.message.toLowerCase().includes('stock')) {
      throw new StockError("Un ou plusieurs produits sont en rupture de stock.");
    }
    throw new AppError('InternalError', `Échec de la commande: ${error.message}`, 500);
  }

  return { orderId: data as string }
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
  if (error) console.error('updateOrderStatus error:', error)
  return !error
}

export async function updateVariantStock(variantId: string, newStock: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('variants')
    .update({ stock: newStock })
    .eq('id', variantId)
  if (error) console.error('updateVariantStock error:', error)
  return !error
}

export async function deleteOrder(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)
  
  if (error) throw new AppError('InternalError', `Échec de la suppression: ${error.message}`, 500)
  return true
}
