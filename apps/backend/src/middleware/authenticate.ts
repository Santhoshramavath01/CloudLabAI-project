/**
 * PURPOSE: Protects routes behind a valid access token. Reads
 * `Authorization: Bearer <token>`, verifies it, and attaches `req.user`.
 * Deliberately does NOT touch the database (that's the point of a JWT
 * access token) — only the refresh flow hits the DB.
 * DEPENDENCIES: express, jsonwebtoken, ../utils/jwt, ../utils/AppError
 */

import type { NextFunction, Request, Response } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next(new AppError('AUTH_TOKEN_MISSING', 'Authentication required', 401));
    return;
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      next(new AppError('AUTH_TOKEN_EXPIRED', 'Access token has expired', 401));
      return;
    }
    next(new AppError('AUTH_TOKEN_INVALID', 'Invalid access token', 401));
  }
}
