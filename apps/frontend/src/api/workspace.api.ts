/**
 * PURPOSE: Typed wrappers around /api/v1/workspaces, including the Phase
 * 2.12 lifecycle actions. Pages/hooks call these instead of touching
 * `apiClient` directly, mirroring api/auth.api.ts and api/dashboard.api.ts.
 * DEPENDENCIES: @cloudlab-ai/shared, ./client, ../types/workspace
 */

import type { ApiResponse } from '@cloudlab-ai/shared';
import { apiClient } from './client';
import type { Workspace } from '../types/workspace';

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
}

export type UpdateWorkspacePayload = Partial<CreateWorkspacePayload>;

async function unwrap(promise: Promise<{ data: ApiResponse<{ workspace: Workspace }> }>): Promise<Workspace> {
  const res = await promise;
  if (!res.data.success) throw new Error(res.data.error.message);
  return res.data.data.workspace;
}

export const workspaceApi = {
  async list(): Promise<Workspace[]> {
    const res = await apiClient.get<ApiResponse<{ workspaces: Workspace[] }>>('/workspaces');
    if (!res.data.success) throw new Error(res.data.error.message);
    return res.data.data.workspaces;
  },

  async getById(id: string): Promise<Workspace> {
    return unwrap(apiClient.get<ApiResponse<{ workspace: Workspace }>>(`/workspaces/${id}`));
  },

  async create(payload: CreateWorkspacePayload): Promise<Workspace> {
    return unwrap(apiClient.post<ApiResponse<{ workspace: Workspace }>>('/workspaces', payload));
  },

  async update(id: string, payload: UpdateWorkspacePayload): Promise<Workspace> {
    return unwrap(apiClient.patch<ApiResponse<{ workspace: Workspace }>>(`/workspaces/${id}`, payload));
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/workspaces/${id}`);
  },

  async start(id: string): Promise<Workspace> {
    return unwrap(apiClient.post<ApiResponse<{ workspace: Workspace }>>(`/workspaces/${id}/start`));
  },

  async stop(id: string): Promise<Workspace> {
    return unwrap(apiClient.post<ApiResponse<{ workspace: Workspace }>>(`/workspaces/${id}/stop`));
  },

  async restart(id: string): Promise<Workspace> {
    return unwrap(apiClient.post<ApiResponse<{ workspace: Workspace }>>(`/workspaces/${id}/restart`));
  }
};
