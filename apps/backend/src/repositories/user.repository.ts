/**
 * PURPOSE: Isolates all Prisma queries for User behind a small repository
 * API so services/controllers never import `prisma` directly — keeps
 * database access in one layer per the Phase 2 API architecture rules.
 * DEPENDENCIES: @prisma/client, ../config/database
 */

import type { User } from '@prisma/client';
import { prisma } from '../config/database';

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
}

export const userRepository = {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  create(input: CreateUserInput): Promise<User> {
    return prisma.user.create({ data: input });
  }
};
