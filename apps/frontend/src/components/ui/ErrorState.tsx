/**
 * PURPOSE: Consistent error-state UI for failed data fetches or unexpected
 * render errors, with an optional retry action. Used by ErrorBoundary,
 * the router's errorElement, and any query error branch.
 * DEPENDENCIES: react, lucide-react, ./Button
 */

import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({
  icon,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  retryLabel = 'Try again',
  onRetry
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border-subtle bg-surface-raised px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-danger/10 text-status-danger">
        {icon ?? <AlertTriangle className="h-5 w-5" />}
      </div>
      <h3 className="text-base font-medium text-text-primary">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-5">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
