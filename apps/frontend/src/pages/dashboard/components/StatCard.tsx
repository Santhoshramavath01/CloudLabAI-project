/**
 * PURPOSE: Single metric tile for the dashboard's top stat row (CPU load,
 * memory, uptime, Docker status). Kept as its own component instead of
 * inline JSX in DashboardPage so the grid stays readable and the card
 * markup isn't duplicated four times.
 * DEPENDENCIES: react, lucide-react, ../../../components/ui
 */

import type { ReactNode } from 'react';
import { Card, Skeleton } from '../../../components/ui';

export interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  hint?: string;
  isLoading?: boolean;
}

export function StatCard({ label, value, icon, hint, isLoading }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
          {isLoading ? (
            <Skeleton variant="text" className="mt-2.5 h-7 w-20" />
          ) : (
            <p className="mt-1.5 text-2xl font-semibold text-text-primary">{value}</p>
          )}
          {hint && !isLoading && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
          {icon}
        </span>
      </div>
    </Card>
  );
}
