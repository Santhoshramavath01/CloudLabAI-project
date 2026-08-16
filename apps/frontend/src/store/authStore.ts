/**
 * PURPOSE: Global auth state. Holds the in-memory access token (never
 * persisted to localStorage — an XSS that can read localStorage can read
 * a persisted token just as easily, so keeping it JS-heap-only and
 * short-lived is the safer default) plus the current user and a status
 * flag the router/ProtectedRoute use to know whether session restoration
 * is still in flight. A plain zustand store already gives every component
 * the same global-state access a React Context would, without a
 * <Provider> to wire up — so no separate AuthContext was added (Phase 2.2
 * rule: no duplicate components/abstractions for the same job).
 * DEPENDENCIES: zustand, ../api/auth.api, ../types/auth
 */

import { create } from 'zustand';
import { authApi } from '../api/auth.api';
import type { AuthUser } from '../types/auth';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  status: AuthStatus;
  setSession: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
  /** Attempts a silent refresh using the httpOnly refresh cookie. Called
   * once on app boot so a returning user with a valid cookie lands
   * authenticated without re-entering credentials. */
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: 'idle',

  setSession: (user, accessToken) => set({ user, accessToken, status: 'authenticated' }),

  setAccessToken: (accessToken) => set({ accessToken }),

  clearSession: () => set({ user: null, accessToken: null, status: 'unauthenticated' }),

  restoreSession: async () => {
    set({ status: 'loading' });
    try {
      const session = await authApi.refresh();
      set({ user: session.user, accessToken: session.accessToken, status: 'authenticated' });
    } catch {
      set({ user: null, accessToken: null, status: 'unauthenticated' });
    }
  }
}));
