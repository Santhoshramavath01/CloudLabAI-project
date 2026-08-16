/**
 * Shared, wire-level types used by both frontend and backend.
 * Keep this file framework-agnostic (no React/Express types here).
 */

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export enum WorkspaceStatus {
  CREATING = 'CREATING',
  STARTING = 'STARTING',
  RUNNING = 'RUNNING',
  STOPPING = 'STOPPING',
  STOPPED = 'STOPPED',
  ERROR = 'ERROR',
  DELETING = 'DELETING',
  DELETED = 'DELETED'
}

export enum ContainerStatus {
  CREATING = 'CREATING',
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  RESTARTING = 'RESTARTING',
  ERROR = 'ERROR',
  REMOVING = 'REMOVING'
}

export enum WorkspaceRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
  VIEWER = 'VIEWER'
}
