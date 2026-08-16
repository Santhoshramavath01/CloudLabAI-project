/**
 * PURPOSE: Single place that defines the refresh-token cookie's name and
 * options, so the controller never hand-writes cookie flags inline and
 * risks setting/clearing them inconsistently.
 * DEPENDENCIES: express, ../config/env, ./jwt
 */

import type { CookieOptions, Response } from 'express';
import { env } from '../config/env';
import { durationToMs } from './jwt';

export const REFRESH_COOKIE_NAME = 'cloudlab_refresh_token';

/** Scoped to /api/v1/auth only — this cookie has no reason to be sent on
 * every request, just the ones that need it (refresh, logout). */
const REFRESH_COOKIE_PATH = '/api/v1/auth';

function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: REFRESH_COOKIE_PATH,
    maxAge: durationToMs(env.JWT_REFRESH_EXPIRES_IN)
  };
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions());
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
}
