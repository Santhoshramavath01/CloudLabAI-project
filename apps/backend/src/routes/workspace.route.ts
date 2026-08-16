/**
 * PURPOSE: Route table for /api/v1/workspaces, including the Phase 2.12
 * lifecycle actions. Every route requires authentication — ownership and
 * state-machine checks are enforced one layer down in
 * workspace.service.ts.
 * DEPENDENCIES: express, ../controllers/workspace.controller,
 * ../middleware/authenticate, ../middleware/validate,
 * ../validators/workspace.validator, ../utils/asyncHandler
 */

import { Router } from 'express';
import { workspaceController } from '../controllers/workspace.controller';
import { authenticate } from '../middleware/authenticate';
import { validateBody } from '../middleware/validate';
import { createWorkspaceSchema, updateWorkspaceSchema } from '../validators/workspace.validator';
import { asyncHandler } from '../utils/asyncHandler';

export const workspaceRouter = Router();

workspaceRouter.use(authenticate);

workspaceRouter.get('/', asyncHandler(workspaceController.list));
workspaceRouter.post('/', validateBody(createWorkspaceSchema), asyncHandler(workspaceController.create));
workspaceRouter.get('/:id', asyncHandler(workspaceController.getById));
workspaceRouter.patch('/:id', validateBody(updateWorkspaceSchema), asyncHandler(workspaceController.update));
workspaceRouter.delete('/:id', asyncHandler(workspaceController.remove));

// Lifecycle actions — POST since they trigger a side effect (a Docker
// operation), not a resource update; no request body to validate.
workspaceRouter.post('/:id/start', asyncHandler(workspaceController.start));
workspaceRouter.post('/:id/stop', asyncHandler(workspaceController.stop));
workspaceRouter.post('/:id/restart', asyncHandler(workspaceController.restart));
