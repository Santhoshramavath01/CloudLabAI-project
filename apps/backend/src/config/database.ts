/**
 * PURPOSE: Single shared Prisma client instance for the whole backend.
 * Prevents connection-pool exhaustion from multiple PrismaClient
 * instantiations, especially under `tsx watch` hot reloads in dev.
 * DEPENDENCIES: @prisma/client, ./env, ./logger
 */

import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { logger } from './logger';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info('Connected to PostgreSQL via Prisma');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
