/**
 * PURPOSE: Single shared axios instance for every backend call. Attaches
 * the in-memory access token to outgoing requests and, on a 401, attempts
 * exactly one silent refresh (via the httpOnly refresh cookie) before
 * retrying the original request — so a page doesn't bounce the user to
 * login just because their 15-minute access token expired mid-session.
 * DEPENDENCIES: axios, ../store/authStore
 */

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  // Sends the httpOnly refresh cookie on same-site requests (needed for
  // /auth/refresh and /auth/logout); harmless no-op for every other route.
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

// Multiple requests can 401 at once (e.g. a page firing several queries
// right as the access token expires) — share one in-flight refresh call
// instead of hitting /auth/refresh once per request.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ success: true; data: { accessToken: string } }>(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .then((res) => res.data.data.accessToken)
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const isAuthRoute = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/register');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retried && !isAuthRoute) {
      originalRequest._retried = true;
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        useAuthStore.getState().setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      }

      useAuthStore.getState().clearSession();
    }

    return Promise.reject(error);
  }
);
