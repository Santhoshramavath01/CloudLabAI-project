/**
 * PURPOSE: Frontend-side shape of the auth data the backend returns.
 * Mirrors AuthUser in apps/backend/src/services/auth.service.ts — kept as
 * a plain type here rather than in @cloudlab-ai/shared since it's a REST
 * response shape, not a wire-level primitive the way WorkspaceStatus is.
 * DEPENDENCIES: none
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}
