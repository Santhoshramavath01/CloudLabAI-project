/**
 * PURPOSE: Renders live database/Redis/Docker connectivity as status rows
 * with Badge indicators. Separate from StatCard since this is
 * pass/fail-per-service rather than a single numeric metric.
 * DEPENDENCIES: react, ../../../components/ui, ../../../types/dashboard
 */

import { Card, Badge, Skeleton } from '../../../components/ui';
import type { DashboardSummary } from '../../../types/dashboard';

export interface SystemStatusPanelProps {
  summary?: DashboardSummary;
  isLoading?: boolean;
}

const rows = [
  { key: 'database' as const, label: 'PostgreSQL' },
  { key: 'redis' as const, label: 'Redis' }
];

export function SystemStatusPanel({ summary, isLoading }: SystemStatusPanelProps) {
  return (
    <Card header={<h2 className="text-sm font-semibold text-text-primary">System status</h2>}>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">{row.label}</span>
            {isLoading || !summary ? (
              <Skeleton variant="text" className="h-5 w-16" />
            ) : (
              <Badge variant={summary.infra[row.key] === 'ok' ? 'success' : 'danger'} dot>
                {summary.infra[row.key] === 'ok' ? 'Connected' : 'Unreachable'}
              </Badge>
            )}
          </div>
        ))}

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Docker daemon</span>
          {isLoading || !summary ? (
            <Skeleton variant="text" className="h-5 w-16" />
          ) : (
            <Badge variant={summary.docker.connected ? 'success' : 'warning'} dot>
              {summary.docker.connected ? `Connected${summary.docker.version ? ` · v${summary.docker.version}` : ''}` : 'Unreachable'}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
