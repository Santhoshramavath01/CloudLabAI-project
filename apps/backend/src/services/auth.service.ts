/**
 * PURPOSE: Orchestrates registration, login, refresh-rotation, logout, and
 * current-user lookup. Controllers stay thin (parse request → call
 * service → shape response); all business logic and DB/JWT coordination
 * lives here.
 * DEPENDENCIES: crypto, ../repositories/user.repository,
 * ../repositories/refreshToken.repository, ../utils/password, ../utils/jwt,
 * ../utils/AppError
 */

import { randomUUID } from 'crypto';
import { userRepository } from '../repositories/user.repository';
import { refreshTokenRepository } from '../repositories/refreshToken.repository';
import { hashPassword, verifyPassword } from '../utils/password';
import {
  durationToMs,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from '../utils/jwt';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RequestContext {
  userAgent?: string;
  ipAddress?: string;
}

function toAuthUser(user: { id: string; email: string; name: string | null }): AuthUser {
  return { id: user.id, email: user.email, name: user.name };
}

/** Issues a fresh access+refresh pair and persists the refresh token's
 * hash. Shared by register/login/refresh so rotation logic exists once. */
async function issueTokens(userId: string, email: string, ctx: RequestContext): Promise<AuthTokens> {
  const jti = randomUUID();
  const accessToken = signAccessToken({ sub: userId, email });
  const refreshToken = signRefreshToken({ sub: userId, jti });

  await refreshTokenRepository.create({
    id: jti,
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + durationToMs(env.JWT_REFRESH_EXPIRES_IN)),
    userAgent: ctx.userAgent,
    ipAddress: ctx.ipAddress
  });

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput, ctx: RequestContext): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError('AUTH_EMAIL_TAKEN', 'An account with this email already exists', 409);
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      email: input.email,
      password: passwordHash,
      name: input.name
    });

    const tokens = await issueTokens(user.id, user.email, ctx);
    return { user: toAuthUser(user), tokens };
  },

  async login(input: LoginInput, ctx: RequestContext): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError('AUTH_INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    const isValid = await verifyPassword(user.password, input.password);
    if (!isValid) {
      throw new AppError('AUTH_INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    const tokens = await issueTokens(user.id, user.email, ctx);
    return { user: toAuthUser(user), tokens };
  },

  async refresh(presentedToken: string, ctx: RequestContext): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    let payload;
    try {
      payload = verifyRefreshToken(presentedToken);
    } catch {
      throw new AppError('AUTH_REFRESH_INVALID', 'Session expired, please sign in again', 401);
    }

    const record = await refreshTokenRepository.findById(payload.jti);
    const presentedHash = hashToken(presentedToken);

    if (!record || record.revokedAt || record.expiresAt < new Date() || record.tokenHash !== presentedHash) {
      throw new AppError('AUTH_REFRESH_INVALID', 'Session expired, please sign in again', 401);
    }

    const user = await userRepository.findById(record.userId);
    if (!user) {
      throw new AppError('AUTH_REFRESH_INVALID', 'Session expired, please sign in again', 401);
    }

    // Rotate: the presented refresh token is single-use. Revoking it here
    // means a stolen-and-replayed token stops working the moment the
    // legitimate client refreshes.
    await refreshTokenRepository.revoke(record.id);

    const tokens = await issueTokens(user.id, user.email, ctx);
    return { user: toAuthUser(user), tokens };
  },

  async logout(presentedToken: string | undefined): Promise<void> {
    if (!presentedToken) return;

    try {
      const payload = verifyRefreshToken(presentedToken);
      await refreshTokenRepository.revoke(payload.jti);
    } catch {
      // Already invalid/expired/tampered — logging out is idempotent
      // either way, so there's nothing further to do.
    }
  },

  async getCurrentUser(userId: string): Promise<AuthUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return toAuthUser(user);
  }
};
