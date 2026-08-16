/**
 * PURPOSE: Single workspace tile for the workspaces grid. Shows name,
 * description, status badge, and now (Phase 2.12) real lifecycle actions —
 * Start/Stop/Restart wired to the backend's Docker-backed endpoints —
 * plus the existing delete action. Buttons are derived from `status`
 * alone (never a separate local "is this running" flag) so the card can
 * never show an action that contradicts what the badge says.
 * DEPENDENCIES: react, lucide-react, ../../../components/ui,
 * ../../../types/workspace, ../../../utils/workspaceStatus
 */

import { useState } from 'react';
import { Trash2, Boxes, Play, Square, RotateCw } from 'lucide-react';
import { Card, Badge, Button, ConfirmDialog } from '../../../components/ui';
import { WorkspaceStatus, type Workspace } from '../../../types/workspace';
import { workspaceStatusConfig } from '../../../utils/workspaceStatus';

export interface WorkspaceCardProps {
  workspace: Workspace;
  onDelete: (id: string) => Promise<void>;
 onStart: (id: string) => Promise<Workspace>;
onStop: (id: string) => Promise<Workspace>;
onRestart: (id: string) => Promise<Workspace>;
  /** True while THIS workspace has a start/stop/restart mutation in
   * flight — disables every lifecycle button on the card (not just the
   * one that was clicked) so a second click can't race the first. */
  isLifecycleActionPending: boolean;
}

const TRANSITIONAL_STATUSES = new Set<WorkspaceStatus>([
  WorkspaceStatus.CREATING,
  WorkspaceStatus.STARTING,
  WorkspaceStatus.STOPPING,
  WorkspaceStatus.DELETING
]);

export function WorkspaceCard({
  workspace,
  onDelete,
  onStart,
  onStop,
  onRestart,
  isLifecycleActionPending
}: WorkspaceCardProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const status = workspaceStatusConfig[workspace.status];

  const isTransitioning = TRANSITIONAL_STATUSES.has(workspace.status);
  const isRunning = workspace.status === WorkspaceStatus.RUNNING;
  const canStart = !isRunning && !isTransitioning;
  const canStop = isRunning;
  const canRestart = (isRunning || workspace.status === WorkspaceStatus.ERROR) && Boolean(workspace.containerId);
  const disableAll = isLifecycleActionPending || isTransitioning;

  return (
    <>
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Boxes className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-text-primary">{workspace.name}</h3>
              <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">
                {workspace.description || 'No description'}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label={`Delete ${workspace.name}`}
            onClick={(event) => {
              event.stopPropagation();
              setIsConfirmOpen(true);
            }}
            className="shrink-0 rounded-md p-1.5 text-text-muted hover:bg-status-danger/10 hover:text-status-danger"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Badge variant={status.variant} dot>
            {status.label}
          </Badge>
          <span className="text-xs text-text-muted">{new Date(workspace.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-border-subtle pt-3">
          {canStart && (
            <Button
              size="sm"
              variant="secondary"
              disabled={disableAll}
              onClick={() => void onStart(workspace.id)}
            >
              <Play className="h-3.5 w-3.5" />
              Start
            </Button>
          )}
          {canStop && (
            <Button size="sm" variant="secondary" disabled={disableAll} onClick={() => void onStop(workspace.id)}>
              <Square className="h-3.5 w-3.5" />
              Stop
            </Button>
          )}
          {canRestart && (
            <Button
              size="sm"
              variant="ghost"
              disabled={disableAll}
              onClick={() => void onRestart(workspace.id)}
            >
              <RotateCw className="h-3.5 w-3.5" />
              Restart
            </Button>
          )}
          {isTransitioning && <span className="text-xs text-text-muted">{status.label}…</span>}
        </div>
      </Card>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => onDelete(workspace.id)}
        title="Delete workspace?"
        description={`"${workspace.name}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
