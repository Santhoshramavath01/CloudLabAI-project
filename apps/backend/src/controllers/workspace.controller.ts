/**
 * PURPOSE: Thin HTTP layer for /api/v1/workspaces, including the Phase
 * 2.12 lifecycle actions (start/stop/restart). Parses request → calls
 * workspaceService → shapes response. No Prisma or Docker calls here —
 * that's in the service.
 * DEPENDENCIES: express, ../services/workspace.service, ../utils/AppError
 */

import type { Request, Response } from 'express';
import { workspaceService } from '../services/workspace.service';
import { AppError } from '../utils/AppError';
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from '../validators/workspace.validator';

function requireUserId(req: Request): string {
  // `authenticate` middleware guarantees req.user is set on every route
  // this controller is mounted behind.
  return req.user!.id;
}

function requireWorkspaceId(req: Request): string {
  const id = req.params.id;
  if (!id) {
    throw new AppError('WORKSPACE_ID_MISSING', 'Workspace id is required', 400);
  }
  return id;
}

export const workspaceController = {
  async list(req: Request, res: Response): Promise<void> {
    const workspaces = await workspaceService.list(requireUserId(req));
    res.status(200).json({ success: true, data: { workspaces } });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const workspace = await workspaceService.getById(requireWorkspaceId(req), requireUserId(req));
    res.status(200).json({ success: true, data: { workspace } });
  },

  async create(req: Request, res: Response): Promise<void> {
    const workspace = await workspaceService.create(requireUserId(req), req.body as CreateWorkspaceInput);
    res.status(201).json({ success: true, data: { workspace } });
  },

  async update(req: Request, res: Response): Promise<void> {
    const workspace = await workspaceService.update(
      requireWorkspaceId(req),
      requireUserId(req),
      req.body as UpdateWorkspaceInput
    );
    res.status(200).json({ success: true, data: { workspace } });
  },

  async remove(req: Request, res: Response): Promise<void> {
    await workspaceService.remove(requireWorkspaceId(req), requireUserId(req));
    res.status(200).json({ success: true, data: { deleted: true } });
  },

  async start(req: Request, res: Response): Promise<void> {
    const workspace = await workspaceService.start(requireWorkspaceId(req), requireUserId(req));
    res.status(200).json({ success: true, data: { workspace } });
  },

  async stop(req: Request, res: Response): Promise<void> {
    const workspace = await workspaceService.stop(requireWorkspaceId(req), requireUserId(req));
    res.status(200).json({ success: true, data: { workspace } });
  },

  async restart(req: Request, res: Response): Promise<void> {
    const workspace = await workspaceService.restart(requireWorkspaceId(req), requireUserId(req));
    res.status(200).json({ success: true, data: { workspace } });
  }
};
