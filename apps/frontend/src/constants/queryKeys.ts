/**
 * PURPOSE: Central react-query key registry. The dashboard's
 * "Recent workspaces" panel and the full Workspaces page both list
 * workspaces — using the same key here means they share one cache entry
 * (and one in-flight request) instead of each firing its own fetch.
 * DEPENDENCIES: none
 */

export const QUERY_KEYS = {
  dashboardSummary: ['dashboard', 'summary'] as const,
  workspaces: ['workspaces'] as const,
  workspace: (id: string) => ['workspaces', id] as const
};
