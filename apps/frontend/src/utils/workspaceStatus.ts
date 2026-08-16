/**
 * PURPOSE: Maps workspace lifecycle statuses to frontend badge variants and
 * display labels. The values mirror WorkspaceStatus from the shared package.
 */

import type { BadgeVariant } from '../components/ui';

export type WorkspaceStatus =
  | 'CREATING'
  | 'STARTING'
  | 'RUNNING'
  | 'STOPPING'
  | 'STOPPED'
  | 'ERROR'
  | 'DELETING'
  | 'DELETED';

export interface WorkspaceStatusConfig {
  label: string;
  variant: BadgeVariant;
}

export const workspaceStatusConfig: Record<
  WorkspaceStatus,
  WorkspaceStatusConfig
> = {
  CREATING: {
    label: 'Creating',
    variant: 'warning'
  },
  STARTING: {
    label: 'Starting',
    variant: 'warning'
  },
  RUNNING: {
    label: 'Running',
    variant: 'success'
  },
  STOPPING: {
    label: 'Stopping',
    variant: 'warning'
  },
  STOPPED: {
    label: 'Stopped',
    variant: 'neutral'
  },
  ERROR: {
    label: 'Error',
    variant: 'danger'
  },
  DELETING: {
    label: 'Deleting',
    variant: 'warning'
  },
  DELETED: {
    label: 'Deleted',
    variant: 'neutral'
  }
};

export function getWorkspaceStatusConfig(
  status: string
): WorkspaceStatusConfig {
  if (status in workspaceStatusConfig) {
    return workspaceStatusConfig[status as WorkspaceStatus];
  }

  return {
    label: status,
    variant: 'neutral'
  };
}