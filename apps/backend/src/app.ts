/**
 * PURPOSE: Builds and configures the Express application (middleware,
 * routes, error handling) without starting an HTTP server. Kept separate
 * from server.ts so the app instance is importable in tests without
 * binding a port.
 * DEPENDENCIES: express, cors, helmet, cookie-parser, ./config/env,
 * ./routes/health.route, ./routes/auth.route, ./routes/dashboard.route,
 * ./routes/workspace.route, ./middleware/errorHandler,
 * ./middleware/rateLimiter
 */

import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { healthRouter } from './routes/health.route';
import { authRouter } from './routes/auth.route';
import { dashboardRouter } from './routes/dashboard.route';
import { workspaceRouter } from './routes/workspace.route';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

export function createApp(): Express {
  const app = express();

  // Trust the first proxy hop (needed for correct req.ip / rate limiting
  // behind Docker/nginx) without trusting the whole chain.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health check is intentionally outside /api/v1 so infra tooling
  // (Docker healthcheck, load balancers) can hit a stable path.
  app.use('/health', healthRouter);

  const apiV1 = express.Router();
  apiV1.use(apiLimiter);

  apiV1.get('/', (_req, res) => {
    res.json({
      success: true,
      data: {
        name: 'CloudLab-AI API',
        version: 'v1',
        status: 'online'
      }
    });
  });

  apiV1.use('/auth', authRouter);
  apiV1.use('/dashboard', dashboardRouter);
  apiV1.use('/workspaces', workspaceRouter);
  // Future phases mount: apiV1.use('/docker', dockerRouter); etc.

  app.use('/api/v1', apiV1);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
