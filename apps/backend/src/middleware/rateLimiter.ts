/**
 * PURPOSE: Rate limiting for the API. `apiLimiter` is mounted globally as
 * a baseline; `authLimiter` is stricter and mounted only on the
 * credential-guessing-prone routes (login/register) per docs/security.md.
 * DEPENDENCIES: express-rate-limit, ../utils/AppError
 */

import rateLimit from 'express-rate-limit';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

// express-rate-limit's internal store calls are async, so the handler must
// call next(error) rather than throw — a synchronous throw inside that
// async call chain would become an unhandled rejection instead of
// reaching errorHandler.
function rateLimitHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError('RATE_LIMITED', 'Too many requests, please try again later', 429));
}

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler
});

/** 20 attempts per 15 minutes per IP across login+register combined —
 * generous enough for a real user who mistypes a password, tight enough
 * to blunt credential-stuffing. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler
});
