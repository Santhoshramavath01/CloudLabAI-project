/**
 * PURPOSE: "Recent workspaces" dashboard section. Now that the Workspace
 * module exists (Phase 2.7), this fetches real data via
 * QUERY_KEYS.workspaces — the same cache key the full WorkspacesPage uses,
 * so navigating between the two doesn't re-fetch. Still renders a real
 * EmptyState (not fake rows) when the list is genuinely empty.
 * DEPENDENCIES: react-router-dom, @tanstack/react-query, lucide-react,
 * ../../../components/ui, ../../../constants/routes,
 * ../../../constants/queryKeys, ../../../api/workspace.api,
 * ../../../utils/workspaceStatus
 */

import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Boxes, ArrowRight } from 'lucide-react';
import { Card, Badge, EmptyState, Skeleton } from '../../../components/ui';
import { ROUTES } from '../../../constants/routes';
import { QUERY_KEYS } from '../../../constants/queryKeys';
import { workspaceApi } from '../../../api/workspace.api';
import { workspaceStatusConfig } from '../../../utils/workspaceStatus';

const RECENT_LIMIT = 5;

export function RecentWorkspaces() {
  const navigate = useNavigate();

  const { data: workspaces, isLoading } = useQuery({
    queryKey: QUERY_KEYS.workspaces,
    queryFn: workspaceApi.list
  });

  const recent = workspaces?.slice(0, RECENT_LIMIT) ?? [];

  return (
    <Card
      header={
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Recent workspaces</h2>
          {workspaces && workspaces.length > 0 && (
            <button
              type="button"
              onClick={() => navigate(ROUTES.workspaces)}
              className="flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      }
    >
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant="text" className="h-10" />
          ))}
        </div>
      )}

      {!isLoading && recent.length === 0 && (
        <EmptyState
          icon={<Boxes className="h-5 w-5" />}
          title="No workspaces yet"
          description="Create your first cloud dev environment to see it here."
          actionLabel="Create workspace"
          onAction={() => navigate(ROUTES.workspaces)}
        />
      )}

      {!isLoading && recent.length > 0 && (
        <ul className="divide-y divide-border-subtle">
          {recent.map((workspace) => {
            const status = workspaceStatusConfig[workspace.status];
            return (
              <li key={workspace.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">{workspace.name}</p>
                  <p className="truncate text-xs text-text-muted">
                    {workspace.description || 'No description'}
                  </p>
                </div>
                <Badge variant={status.variant} dot>
                  {status.label}
                </Badge>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
