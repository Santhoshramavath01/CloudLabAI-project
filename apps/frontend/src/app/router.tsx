/**
 * PURPOSE: Central route table for the whole frontend. Splits routes into
 * a protected DashboardLayout group and a public AuthLayout group, and
 * attaches a route-level error boundary to each.
 * DEPENDENCIES: react-router-dom, ../layouts/DashboardLayout,
 * ../layouts/AuthLayout, ../components/ProtectedRoute, ../pages/*,
 * ../constants/routes
 */

import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import DashboardPage from '../pages/dashboard/DashboardPage';
import WorkspacesPage from '../pages/workspaces/WorkspacesPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import NotFoundPage from '../pages/errors/NotFoundPage';
import ErrorPage from '../pages/errors/ErrorPage';
import ComingSoonPage from '../pages/ComingSoonPage';
import { ROUTES } from '../constants/routes';

export const router = createBrowserRouter([
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: ROUTES.workspaces.slice(1), element: <WorkspacesPage /> },
      { path: ROUTES.docker.slice(1), element: <ComingSoonPage title="Docker" /> },
      { path: ROUTES.terminal.slice(1), element: <ComingSoonPage title="Terminal" /> },
      { path: ROUTES.files.slice(1), element: <ComingSoonPage title="Files" /> },
      { path: ROUTES.git.slice(1), element: <ComingSoonPage title="Git" /> },
      { path: ROUTES.ai.slice(1), element: <ComingSoonPage title="AI Assistant" /> },
      { path: ROUTES.monitoring.slice(1), element: <ComingSoonPage title="Monitoring" /> },
      { path: ROUTES.settings.slice(1), element: <ComingSoonPage title="Settings" /> }
    ]
  },
  {
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: ROUTES.login.slice(1), element: <LoginPage /> },
      { path: ROUTES.register.slice(1), element: <RegisterPage /> }
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);
