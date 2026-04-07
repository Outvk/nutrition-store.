import { createClient } from './server'
import { Product, Brand, Category } from '@/types'

export async function getProducts(page = 0, filters: { brand_id?: string, category_id?: string, is_on_sale?: boolean } = {}): Promise<{ products: Product[], total: number }> {
  const supabase = await createClient()
  const PAGE_SIZE = 12
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('products')
    .select('id, name, description, price, sale_price, images, is_on_sale, brand_id, category_id, is_active', { count: 'exact' })
    .eq('is_active', true)

  if (filters.brand_id) query = query.eq('brand_id', filters.brand_id)
  if (filters.category_id) query = query.eq('category_id', filters.category_id)
  if (filters.is_on_sale !== undefined) query = query.eq('is_on_sale', filters.is_on_sale)

  const { data, count, error } = await query.range(from, to).order('created_at', { ascending: false })
  if (error) console.error('getProducts error:', error)
  return { products: (data as Product[]) || [], total: count || 0 }
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, variants(*), brand:brand_id(*), category:category_id(*)')
    .eq('id', id)
    .single()
  if (error) console.error('getProductById error:', error)
  return data as Product | null
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, sale_price, images, is_on_sale, brand_id, category_id, is_active')
    .eq('is_active', true)
    .limit(4)
  if (error) console.error('getFeaturedProducts error:', error)
  return (data as Product[]) || []
}

export async function getSaleProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, sale_price, images, is_on_sale, brand_id, category_id, is_active')
    .eq('is_on_sale', true)
    .eq('is_active', true)
  if (error) console.error('getSaleProducts error:', error)
  return (data as Product[]) || []
}

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('brands')
    .select('id, name, logo_url')
    .eq('is_visible', true)
  if (error) console.error('getBrands error:', error)
  return (data as Brand[]) || []
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, image_url')
  if (error) console.error('getCategories error:', error)
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
    .select('id, full_name, phone, wilaya, address, total, delivery_fee, status, created_at')
    .order('created_at', { ascending: false })
  if (error) console.error('getAllOrders error:', error)
  return data || []
}

export async function getDashboardStats() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_dashboard_stats')
  if (error) console.error('getDashboardStats error:', error)
  return data
}

export async function insertOrder(orderData: any, items: any[]) {
  const supabase = await createClient()
  
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([orderData])
    .select('id')
    .single()

  if (orderError) throw new Error(orderError.message)

  const orderItemsWithId = items.map(item => ({
    ...item,
    order_id: order.id
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsWithId)

  if (itemsError) throw new Error(itemsError.message)

  for (const item of items) {
    if (item.variant_id) {
      const { error: stockError } = await supabase.rpc('decrement_stock', {
        p_variant_id: item.variant_id,
        p_quantity: item.quantity
      })
      if (stockError) console.error('decrement_stock error for variant:', item.variant_id, stockError)
    }
  }

  return { orderId: order.id }
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
  
  if (error) console.error('deleteOrder error:', error)
  return !error
}
