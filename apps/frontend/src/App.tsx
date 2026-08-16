/**
 * PURPOSE: Root application component. Restores the auth session (silent
 * refresh via the httpOnly cookie) exactly once before the router mounts,
 * wraps routing in the top-level ErrorBoundary, and mounts the global
 * ToastContainer once so any component can call `toast.success(...)` /
 * `toast.error(...)` without prop-drilling.
 * DEPENDENCIES: react, react-router-dom, ./app/router,
 * ./components/ErrorBoundary, ./components/ui, ./store/authStore
 */

import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/ui';
import { useAuthStore } from './store/authStore';

export default function App() {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    void restoreSession();
    // Intentionally run once on mount — restoreSession is a stable
    // zustand action reference, not a reactive dependency.
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <ToastContainer />
    </ErrorBoundary>
  );
}
