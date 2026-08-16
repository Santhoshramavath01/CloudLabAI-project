/**
 * PURPOSE: Route table for /api/v1/dashboard. Requires authentication —
 * this exposes host-level metrics that shouldn't be publicly reachable.
 * DEPENDENCIES: express, ../controllers/dashboard.controller,
 * ../middleware/authenticate, ../utils/asyncHandler
 */

import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/authenticate';
import { asyncHandler } from '../utils/asyncHandler';

export const dashboardRouter = Router();

dashboardRouter.get('/summary', authenticate, asyncHandler(dashboardController.summary));
