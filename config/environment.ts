// config/environment.ts
import { z } from 'zod';

const environmentSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  
  // Supabase (existing)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  
  // Zerion API (existing)
  NEXT_PUBLIC_ZERION_API_KEY: z.string(),
  NEXT_PUBLIC_ZERION_BASE_URL: z.string().url().default('https://api.zerion.io'),
  NEXT_PUBLIC_ZERION_TIMEOUT: z.string().transform(Number).default(30000),
  NEXT_PUBLIC_ZERION_RETRIES: z.string().transform(Number).default(3),
  
  // New variables
  JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  ENABLE_METRICS: z.string().transform(Boolean).default(false),
  
  // Optional
  RESEND_API_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

const validateEnvironment = () => {
  try {
    return environmentSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    process.exit(1);
  }
};

export const env = validateEnvironment();

export const config = {
  app: {
    siteUrl: env.NEXT_PUBLIC_SITE_URL,
    environment: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
  },
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  zerion: {
    apiKey: env.NEXT_PUBLIC_ZERION_API_KEY,
    baseUrl: env.NEXT_PUBLIC_ZERION_BASE_URL,
    timeout: env.NEXT_PUBLIC_ZERION_TIMEOUT,
    retries: env.NEXT_PUBLIC_ZERION_RETRIES,
  },
  auth: {
    jwtSecret: env.JWT_SECRET,
  },
  monitoring: {
    logLevel: env.LOG_LEVEL,
    enableMetrics: env.ENABLE_METRICS,
  },
} as const;