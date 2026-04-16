import { NextResponse } from 'next/server';
import { upsertAbandonedOrder } from '@/lib/supabase/queries';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderData, items, existingOrderId } = body;

    // Minimum validation for abandoned orders: Name or Phone should be present at least partially
    if (!orderData.full_name && !orderData.phone) {
      return NextResponse.json({ error: 'Missing basic info' }, { status: 400 });
    }

    const { orderId } = await upsertAbandonedOrder(orderData, items, existingOrderId);

    return NextResponse.json({ orderId });
  } catch (error: any) {
    console.error('Abandoned Order API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
