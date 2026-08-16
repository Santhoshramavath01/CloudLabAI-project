/**
 * PURPOSE: Isolates all Prisma queries for Workspace behind a small
 * repository API, mirroring user.repository.ts / refreshToken.repository.ts.
 * Ownership checks live in the service layer, not here — this layer only
 * knows how to fetch/write rows.
 * DEPENDENCIES: @prisma/client, ../config/database
 */

import type { Workspace } from '@prisma/client';
import { prisma } from '../config/database';

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
  ownerId: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
}

export interface UpdateWorkspaceStateInput {
  status: Workspace['status'];
  containerId?: string | null;
  containerImage?: string | null;
}

export const workspaceRepository = {
  findManyByOwner(ownerId: string): Promise<Workspace[]> {
    return prisma.workspace.findMany({ where: { ownerId }, orderBy: { createdAt: 'desc' } });
  },

  countByOwner(ownerId: string): Promise<number> {
    return prisma.workspace.count({ where: { ownerId } });
  },

  findById(id: string): Promise<Workspace | null> {
    return prisma.workspace.findUnique({ where: { id } });
  },

  create(input: CreateWorkspaceInput): Promise<Workspace> {
    return prisma.workspace.create({ data: input });
  },

  update(id: string, input: UpdateWorkspaceInput): Promise<Workspace> {
    return prisma.workspace.update({ where: { id }, data: input });
  },

  /** Separate from `update` on purpose: `update` handles the user-editable
   * name/description form fields (Zod-validated request bodies), this
   * handles the lifecycle fields the *service* derives from Docker state —
   * keeping them apart means a PATCH request body can never accidentally
   * set `status`/`containerId` directly. */
  updateState(id: string, input: UpdateWorkspaceStateInput): Promise<Workspace> {
    return prisma.workspace.update({ where: { id }, data: input });
  },

  delete(id: string): Promise<Workspace> {
    return prisma.workspace.delete({ where: { id } });
  }
};
