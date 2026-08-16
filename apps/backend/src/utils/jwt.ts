/**
 * PURPOSE: Signs and verifies the two JWTs the auth system issues — a
 * short-lived access token (payload only, never touches the DB) and a
 * refresh token whose `jti` claim maps 1:1 to a RefreshToken row so it can
 * be looked up, hash-checked, and revoked. Centralizing this means the
 * signing secret/algorithm/expiry is defined exactly once.
 * DEPENDENCIES: jsonwebtoken, crypto, ../config/env
 */

import jwt, { type SignOptions } from 'jsonwebtoken';
import { createHash } from 'crypto';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn']
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn']
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

/**
 * Refresh JWTs are never stored raw — only this hash, so a DB dump alone
 * can't be replayed as a valid session.
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Parses simple "15m" / "30d" / "1h" / "45s" durations into milliseconds.
 */
export function durationToMs(duration: string): number {
  const match = /^(\d+)\s*(s|m|h|d|w)$/i.exec(duration.trim());

  if (!match) {
    throw new Error(`Unsupported duration format: "${duration}"`);
  }

  const value = Number(match[1]);

  const unitMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000
  };

  return value * unitMs[match[2].toLowerCase()];
}