import { ratelimit } from '@/lib/ratelimit';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { insertOrder } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors';

// Validation Schema
const orderSchema = z.object({
  website: z.string().optional(), // honeypot
  full_name: z.string().min(3).max(50),
  phone: z.string().regex(/^(05|06|07)[0-9]{8}$/),
  wilaya: z.string().min(2),
  address: z.string().min(10).max(200),
  total: z.number().min(0),
  delivery_fee: z.number().min(0),
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      variant_id: z.string().uuid().nullable(),
      quantity: z.number().min(1).max(10),
      unit_price: z.number().min(0),
    })
  ).min(1).max(20),
  turnstileToken: z.string(),
});

export async function POST(req: Request) {
  try {
    // Get IP for ratelimiting
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0] : (realIp || '127.0.0.1');

    // 3. rate limit by IP (Skip in local dev if needed, or use high limit)
    const canLimit = ratelimit && process.env.NODE_ENV === 'production';
    // If not production, use separate key for local testing
    const limitKey = `order_${process.env.NODE_ENV === 'production' ? ip : 'local_dev'}`;
    
    if (ratelimit) {
      const { success, limit, reset, remaining } = await ratelimit.limit(limitKey);
      if (!success) {
        return NextResponse.json({ 
          error: 'Trop de tentatives. Veuillez réessayer plus tard.',
          limit,
          remaining,
          reset
        }, { status: 429 });
      }
    }

    const body = await req.json();

    // 4. check honeypot
    if (body.website) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
    }

    // 2. Validate using Zod
    const result = orderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.issues }, { status: 400 });
    }

    const { turnstileToken, items, ...orderData } = result.data;

    // 1. Verify Cloudflare Turnstile token
    const hasValidTurnstile = process.env.TURNSTILE_SECRET && !process.env.TURNSTILE_SECRET.includes("your-");
    if (hasValidTurnstile) {
      const formData = new URLSearchParams();
      formData.append('secret', process.env.TURNSTILE_SECRET!);
      formData.append('response', turnstileToken);
      formData.append('remoteip', ip);

      const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData,
      });

      const turnstileOutcome = await turnstileRes.json();
      if (!turnstileOutcome.success) {
        return NextResponse.json({ error: 'Captcha validation failed' }, { status: 403 });
      }
    }

    // 1.5. SERVER-SIDE PRICE VALIDATION (TASK 3)
    const supabase = await createClient();
    const productIds = Array.from(new Set(items.map(i => i.product_id)));
    const { data: dbProducts, error: dbError } = await supabase
      .from('products')
      .select('id, price, sale_price, is_active')
      .in('id', productIds);

    if (dbError || !dbProducts || dbProducts.length !== productIds.length) {
      return NextResponse.json({ error: 'Certains produits ne sont plus disponibles.' }, { status: 400 });
    }

    const priceMap = new Map(dbProducts.map(p => [p.id, p]));
    let serverTotal = 0;
    
    // Check for inactive products and verify existence
    for (const item of items) {
      const dbProd = priceMap.get(item.product_id);
      if (!dbProd || !dbProd.is_active) {
        return NextResponse.json({ error: `Le produit ${item.product_id} est inactif ou indisponible.` }, { status: 400 });
      }
    }

    const validatedItems = items.map(item => {
      const dbProd = priceMap.get(item.product_id)!;
      const actualPrice = dbProd.sale_price ?? dbProd.price;
      serverTotal += actualPrice * item.quantity;
      return {
        ...item,
        unit_price: actualPrice
      };
    });

    const finalTotal = serverTotal + orderData.delivery_fee;
    const finalOrderData = { ...orderData, total: finalTotal };

    // 5. Insert order + order_items using validated data
    const { orderId } = await insertOrder(finalOrderData, validatedItems);
    
    return NextResponse.json({ orderId });
  } catch (error: unknown) {
    console.error('Order API Error:', error);
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
