/**
 * PURPOSE: Consistent "nothing here yet" state used by lists/pages instead
 * of ad-hoc empty markup per feature (e.g. no workspaces, no containers).
 * DEPENDENCIES: react, lucide-react, ./Button
 */

import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-overlay text-text-secondary">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <h3 className="text-base font-medium text-text-primary">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
