/**
 * PURPOSE: Frontend-side shape of a Workspace as returned by the backend.
 * Keeps the wire-level WorkspaceStatus values compatible with the backend
 * without requiring a runtime import of the shared CommonJS enum.
 */

export const WorkspaceStatus = {
  CREATING: 'CREATING',
  STARTING: 'STARTING',
  RUNNING: 'RUNNING',
  STOPPING: 'STOPPING',
  STOPPED: 'STOPPED',
  ERROR: 'ERROR',
  DELETING: 'DELETING',
  DELETED: 'DELETED'
} as const;

export type WorkspaceStatus =
  (typeof WorkspaceStatus)[keyof typeof WorkspaceStatus];

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  status: WorkspaceStatus;
  containerId: string | null;
  containerImage: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}