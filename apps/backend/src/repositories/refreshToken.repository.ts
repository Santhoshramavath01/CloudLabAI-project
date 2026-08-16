/**
 * PURPOSE: Isolates all Prisma queries for RefreshToken (session records)
 * behind a small repository API, mirroring user.repository.ts.
 * DEPENDENCIES: @prisma/client, ../config/database
 */

import type { RefreshToken } from '@prisma/client';
import { prisma } from '../config/database';

export interface CreateRefreshTokenInput {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export const refreshTokenRepository = {
  create(input: CreateRefreshTokenInput): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data: input });
  },

  findById(id: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { id } });
  },

  revoke(id: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
  },

  revokeAllForUser(userId: string): Promise<{ count: number }> {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }
};
