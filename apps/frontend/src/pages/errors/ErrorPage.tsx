/**
 * PURPOSE: Route-level error boundary passed to React Router as
 * errorElement. Catches loader/action/render errors thrown inside the
 * route tree (distinct from ErrorBoundary, which only catches errors at
 * mount time before the router takes over).
 * DEPENDENCIES: react-router-dom, ../../components/ui
 */

import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { ErrorState } from '../../components/ui';

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  const description = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.';

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-surface-base p-6">
      <div className="w-full max-w-md">
        <ErrorState
          title="Something went wrong"
          description={description}
          retryLabel="Back to dashboard"
          onRetry={() => navigate('/')}
        />
      </div>
    </div>
  );
}
