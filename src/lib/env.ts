import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal('')),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  const issues = _env.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
  console.error('❌ Missing/Invalid Env Vars:', issues);
  throw new Error(`Invalid environment variables: ${issues}`);
}

export const env = _env.data;
