/**
 * PURPOSE: Types for the Docker service layer. Kept separate from
 * docker.service.ts so callers (workspace.service.ts) can import types
 * without pulling in dockerode itself.
 * DEPENDENCIES: none
 */

/** Label attached to every container this platform provisions, so we can
 * always find "the container for workspace X" via Docker's own label
 * filter instead of trusting a possibly-stale containerId in our DB. */
export const WORKSPACE_LABEL_KEY = 'cloudlab.workspaceId';

export interface CreateWorkspaceContainerInput {
  workspaceId: string;
  /** Falls back to env.WORKSPACE_DEFAULT_IMAGE when omitted — no template
   * system exists yet to choose this per-workspace. */
  image?: string;
  cpuLimit?: number;
  memoryMb?: number;
}

export interface ProvisionedContainer {
  containerId: string;
  image: string;
}

/** Deliberately smaller than the full `ContainerStatus` enum in
 * @cloudlab-ai/shared — this is only what we can actually derive from a
 * single `docker inspect` call today. Not-yet-implemented states
 * (RESTARTING, REMOVING as distinct from a terminal state) stay unused
 * until something in this module actually produces them. */
export type DockerContainerState = 'running' | 'exited' | 'created' | 'paused' | 'dead' | 'unknown';

export interface ContainerInspectResult {
  containerId: string;
  state: DockerContainerState;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface ContainerLogsOptions {
  tail?: number;
}
