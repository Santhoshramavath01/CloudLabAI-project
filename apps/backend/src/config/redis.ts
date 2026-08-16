/**
 * PURPOSE: Single shared ioredis client used for caching, rate limiting,
 * and as the connection BullMQ queues/workers will reuse in later phases.
 * DEPENDENCIES: ioredis, ./env, ./logger
 */

import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true
});

redis.on('error', (err) => {
  logger.error('Redis connection error', { message: err.message });
});

export async function connectRedis(): Promise<void> {
  await redis.connect();
  logger.info('Connected to Redis');
}
