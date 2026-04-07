'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function resetRevenue() {
  const supabase = await createClient();
  const fixedId = '00000000-0000-0000-0000-000000000000';

  const { error } = await supabase
    .from('store_settings')
    .upsert({ 
      id: fixedId, 
      revenue_reset_at: new Date().toISOString() 
    });

  if (error) {
    console.error('resetRevenue error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
