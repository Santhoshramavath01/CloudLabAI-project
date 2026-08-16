/**
 * PURPOSE: Typed wrappers around the /api/v1/auth endpoints. Pages/hooks
 * call these instead of touching `apiClient` directly, so the request/
 * response shape for auth is defined in exactly one place.
 * DEPENDENCIES: axios, ../types/auth, ./client
 */

import type { AxiosError } from 'axios';
import type { ApiResponse } from '@cloudlab-ai/shared';
import { apiClient } from './client';
import type { AuthSession, AuthUser } from '../types/auth';

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/** Extracts the backend's { code, message } error envelope, falling back
 * to a generic message for network failures / unexpected shapes. */
export function extractApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  const axiosError = error as AxiosError<ApiResponse<unknown>>;
  const data = axiosError?.response?.data;
  if (data && data.success === false) {
    return data.error.message;
  }
  return fallback;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthSession> {
    const res = await apiClient.post<ApiResponse<AuthSession>>('/auth/register', payload);
    if (!res.data.success) throw new Error(res.data.error.message);
    return res.data.data;
  },

  async login(payload: LoginPayload): Promise<AuthSession> {
    const res = await apiClient.post<ApiResponse<AuthSession>>('/auth/login', payload);
    if (!res.data.success) throw new Error(res.data.error.message);
    return res.data.data;
  },

  async refresh(): Promise<AuthSession> {
    const res = await apiClient.post<ApiResponse<AuthSession>>('/auth/refresh');
    if (!res.data.success) throw new Error(res.data.error.message);
    return res.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async me(): Promise<AuthUser> {
    const res = await apiClient.get<ApiResponse<{ user: AuthUser }>>('/auth/me');
    if (!res.data.success) throw new Error(res.data.error.message);
    return res.data.data.user;
  }
};
