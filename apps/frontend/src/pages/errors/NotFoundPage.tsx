/**
 * PURPOSE: Catch-all 404 page for unmatched routes.
 * DEPENDENCIES: react-router-dom, ../../components/ui, ../../constants/routes
 */

import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { ROUTES } from '../../constants/routes';

export default function NotFoundPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-surface-base px-4 text-center">
      <p className="text-sm font-semibold text-brand">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-text-primary">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link to={ROUTES.dashboard} className="mt-6">
        <Button variant="primary">Back to dashboard</Button>
      </Link>
    </div>
  );
}
