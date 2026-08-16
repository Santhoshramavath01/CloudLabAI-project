/**
 * PURPOSE: Unauthenticated health-check endpoint used by Docker Compose
 * healthchecks, load balancers, and CI smoke tests to verify the API
 * process (and its DB/Redis connections) is up.
 * DEPENDENCIES: express, ../config/database, ../config/redis
 */

import { Router } from 'express';
import { prisma } from '../config/database';
import { redis } from '../config/redis';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  const checks: Record<string, 'ok' | 'error'> = {
    database: 'ok',
    redis: 'ok'
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    checks.database = 'error';
  }

  try {
    await redis.ping();
  } catch {
    checks.redis = 'error';
  }

  const allOk = Object.values(checks).every((v) => v === 'ok');

  res.status(allOk ? 200 : 503).json({
    success: allOk,
    data: {
      status: allOk ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString()
    }
  });
});
