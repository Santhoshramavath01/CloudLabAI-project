/**
 * PURPOSE: Process entrypoint. Connects infrastructure (Postgres, Redis),
 * creates the HTTP server from the Express app, and will attach the
 * Socket.IO gateway in a later phase. Handles graceful shutdown.
 * DEPENDENCIES: http, ./app, ./config/env, ./config/logger,
 * ./config/database, ./config/redis
 */

import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis } from './config/redis';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await connectRedis();

  const app = createApp();
  const server = http.createServer(app);

  // Socket.IO gateway (terminal, docker-logs, metrics, notifications,
  // workspace-status namespaces) is attached here starting Phase 8/11.

  server.listen(env.PORT, () => {
    logger.info(`CloudLab-AI backend listening on port ${env.PORT}`, {
      env: env.NODE_ENV
    });
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Failed to start server', { message: err instanceof Error ? err.message : err });
  process.exit(1);
});
