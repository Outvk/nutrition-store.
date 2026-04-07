import { createClient } from './server'

export async function getLandingContent() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('store_settings')
    .select('landing_content')
    .single()
  
  if (error) console.error('getLandingContent error:', error)
  return data?.landing_content || null
}

export async function updateLandingContent(content: any) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('store_settings')
    .update({ landing_content: content })
    .match({ id: (await supabase.from('store_settings').select('id').single()).data?.id })
    
  if (error) {
    console.error('updateLandingContent error:', error)
    return { success: false, error }
  }
  return { success: true }
}
