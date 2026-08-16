/**
 * PURPOSE: Thin HTTP layer for the dashboard summary endpoint.
 * DEPENDENCIES: express, ../services/dashboard.service
 */

import type { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';

export const dashboardController = {
  async summary(_req: Request, res: Response): Promise<void> {
    const summary = await dashboardService.getSummary();
    res.status(200).json({ success: true, data: summary });
  }
};
