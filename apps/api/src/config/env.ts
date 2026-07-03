import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  FRONTEND_URL: z.string().url().optional(),
});

export type Env = {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  FRONTEND_URL: string;
};

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid API environment: ${message}`);
  }

  const { NODE_ENV, PORT, FRONTEND_URL } = parsed.data;
  const frontendUrl =
    FRONTEND_URL ??
    (NODE_ENV === 'production' ? undefined : 'http://localhost:3000');

  if (!frontendUrl) {
    throw new Error('Invalid API environment: FRONTEND_URL is required in production');
  }

  return { NODE_ENV, PORT, FRONTEND_URL: frontendUrl };
}
