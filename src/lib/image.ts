import { createClient as createBrowserClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

const supabase = createBrowserClient(supabaseUrl, supabaseKey)

export function getProductImage(path: string, size: 'thumb' | 'full' | 'hero'): string {
  if (path.startsWith('http')) return path;

  let transform = {}
  if (size === 'thumb') {
    transform = { width: 400, height: 400, quality: 75, format: 'webp', resize: 'cover' }
  } else if (size === 'full') {
    transform = { width: 1200, height: 1200, quality: 85, format: 'webp', resize: 'cover' }
  } else if (size === 'hero') {
    transform = { width: 1920, height: 800, quality: 80, format: 'webp', resize: 'cover' }
  }

  const { data } = supabase.storage
    .from('products')
    .getPublicUrl(path, { transform })

  return data.publicUrl
}
