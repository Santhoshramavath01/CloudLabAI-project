/**
 * PURPOSE: Route guard for authenticated-only pages. Reads the auth store;
 * while session restoration is in flight it renders a full-screen
 * Spinner, once resolved it either renders the protected children or
 * redirects to login (preserving the attempted location so login can
 * return the user to where they were headed).
 * DEPENDENCIES: react, react-router-dom, ./ui, ../store/authStore,
 * ../constants/routes
 */

import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from './ui';
import { useAuthStore } from '../store/authStore';
import { ROUTES } from '../constants/routes';

export interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): ReactNode {
  const status = useAuthStore((state) => state.status);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface-base">
        <Spinner size="lg" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  return children;
}
