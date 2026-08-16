/**
 * PURPOSE: Loads and validates all required environment variables once at
 * startup, so the rest of the backend can import a fully-typed `env` object
 * instead of reading `process.env` (and risking undefined at runtime) all
 * over the codebase.
 * DEPENDENCIES: dotenv, zod
 */

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  BACKEND_URL: z.string().url().default('http://localhost:4000'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  GITHUB_CLIENT_ID: z.string().optional().default(''),
  GITHUB_CLIENT_SECRET: z.string().optional().default(''),
  GITHUB_CALLBACK_URL: z.string().optional().default(''),

  AI_PROVIDER: z.enum(['openai', 'anthropic', 'local']).default('local'),
  AI_API_KEY: z.string().optional().default(''),
  AI_MODEL: z.string().optional().default(''),

  DOCKER_HOST: z.string().optional().default('/var/run/docker.sock'),
  // No template system yet (that's the Create Workspace Wizard's Step 2,
  // still unbuilt) — every workspace container is provisioned from this
  // single base image until template selection lands.
  WORKSPACE_DEFAULT_IMAGE: z.string().optional().default('node:20-alpine'),
  WORKSPACE_CONTAINER_CPU_LIMIT: z.coerce.number().positive().optional().default(1),
  WORKSPACE_CONTAINER_MEMORY_MB: z.coerce.number().positive().optional().default(1024),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast and loud — a misconfigured environment should never
  // silently boot a half-working server.
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:');
  // eslint-disable-next-line no-console
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
