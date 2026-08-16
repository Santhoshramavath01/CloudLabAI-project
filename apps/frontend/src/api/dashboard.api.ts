/**
 * PURPOSE: Typed wrapper around GET /api/v1/dashboard/summary.
 * DEPENDENCIES: @cloudlab-ai/shared, ./client, ../types/dashboard
 */

import type { ApiResponse } from '@cloudlab-ai/shared';
import { apiClient } from './client';
import type { DashboardSummary } from '../types/dashboard';

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    const res = await apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
    if (!res.data.success) throw new Error(res.data.error.message);
    return res.data.data;
  }
};
