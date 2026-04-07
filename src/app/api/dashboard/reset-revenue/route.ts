import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const fixedId = '00000000-0000-0000-0000-000000000000';

  const { error } = await supabase
    .from('store_settings')
    .upsert({ id: fixedId, revenue_reset_at: new Date().toISOString() });

  if (error) {
    console.error('reset-revenue error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
