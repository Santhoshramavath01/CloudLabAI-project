/**
 * PURPOSE: Central error-handling middleware. Every controller/service
 * throws AppError (or lets an unexpected error bubble up) and this is the
 * single place that turns any thrown error into the standard API envelope.
 * Must be registered LAST, after all routes.
 * DEPENDENCIES: express, ../utils/AppError, ../config/logger, ../config/env
 */

import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';
import { env } from '../config/env';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn(`Handled error on ${req.method} ${req.path}`, {
      code: err.code,
      message: err.message
    });
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {})
      }
    });
    return;
  }

  const message = err instanceof Error ? err.message : 'Unknown error';
  logger.error(`Unhandled error on ${req.method} ${req.path}`, { message });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production' ? 'Internal server error' : message
    }
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  });
}
