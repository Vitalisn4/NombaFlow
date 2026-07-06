import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  FRONTEND_URL: z.string().url().optional(),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  REDIS_URL: z.string().min(1),
  NOMBA_WEBHOOK_SECRET: z.string().min(32),
});

export type Env = {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  FRONTEND_URL: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRY: string;
  JWT_REFRESH_TOKEN_EXPIRY: string;
  REDIS_URL: string;
  NOMBA_WEBHOOK_SECRET: string;
};

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid API environment: ${message}`);
  }

  const {
    NODE_ENV,
    PORT,
    FRONTEND_URL,
    DATABASE_URL,
    JWT_SECRET,
    JWT_ACCESS_TOKEN_EXPIRY,
    JWT_REFRESH_TOKEN_EXPIRY,
    REDIS_URL,
    NOMBA_WEBHOOK_SECRET,
  } = parsed.data;
  const frontendUrl =
    FRONTEND_URL ??
    (NODE_ENV === 'production' ? undefined : 'http://localhost:3000');

  if (!frontendUrl) {
    throw new Error('Invalid API environment: FRONTEND_URL is required in production');
  }

  return {
    NODE_ENV,
    PORT,
    FRONTEND_URL: frontendUrl,
    DATABASE_URL,
    JWT_SECRET,
    JWT_ACCESS_TOKEN_EXPIRY,
    JWT_REFRESH_TOKEN_EXPIRY,
    REDIS_URL,
    NOMBA_WEBHOOK_SECRET,
  };
}
