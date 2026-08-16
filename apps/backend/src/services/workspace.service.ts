/**
 * PURPOSE: Orchestrates workspace CRUD and — this is the Phase 2.10
 * "authorization foundation" piece — enforces that a user can only read
 * or modify their own workspaces. Controllers never call the repository
 * directly, so this ownership check can't accidentally be bypassed.
 *
 * Phase 2.11/2.12 add the lifecycle actions (start/stop/restart). This is
 * the ONLY layer that calls dockerService — controllers never touch
 * Docker directly, and the status/containerId fields are only ever
 * written here via `workspaceRepository.updateState`, never through the
 * generic `update` used by the PATCH endpoint.
 * DEPENDENCIES: @prisma/client, ../repositories/workspace.repository,
 * ../modules/docker/docker.service, ../utils/AppError
 */

import { Prisma, WorkspaceStatus, type Workspace } from '@prisma/client';
import { workspaceRepository } from '../repositories/workspace.repository';
import { dockerService } from '../modules/docker/docker.service';
import { AppError } from '../utils/AppError';
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from '../validators/workspace.validator';

const UNIQUE_CONSTRAINT_ERROR = 'P2002';

function isUniqueConstraintError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === UNIQUE_CONSTRAINT_ERROR;
}

/** Statuses that mean "a lifecycle transition is already in flight" —
 * start/stop/restart all refuse to run again until the in-flight one
 * settles, rather than racing two Docker operations against the same
 * container. */
const TRANSITIONAL_STATUSES: ReadonlySet<WorkspaceStatus> = new Set([
  WorkspaceStatus.CREATING,
  WorkspaceStatus.STARTING,
  WorkspaceStatus.STOPPING,
  WorkspaceStatus.DELETING
]);

/** Best-effort — used inside a catch block, so a second failure here must
 * never mask the original error that triggered it. */
async function markErrored(workspaceId: string): Promise<void> {
  try {
    await workspaceRepository.updateState(workspaceId, { status: WorkspaceStatus.ERROR });
  } catch {
    // Swallowed intentionally — see comment above.
  }
}

/** Shared by getOne/update/remove: fetches the workspace and throws unless
 * the requesting user owns it. 404 (not 403) when the workspace doesn't
 * exist at all, so existence of other users' workspaces isn't leaked. */
async function getOwnedWorkspaceOrThrow(workspaceId: string, userId: string) {
  const workspace = await workspaceRepository.findById(workspaceId);

  if (!workspace) {
    throw AppError.notFound('Workspace not found');
  }

  if (workspace.ownerId !== userId) {
    throw AppError.forbidden("You don't have access to this workspace");
  }

  return workspace;
}

export const workspaceService = {
  async list(userId: string) {
    return workspaceRepository.findManyByOwner(userId);
  },

  async getById(workspaceId: string, userId: string) {
    return getOwnedWorkspaceOrThrow(workspaceId, userId);
  },

  async create(userId: string, input: CreateWorkspaceInput) {
    try {
      return await workspaceRepository.create({ ...input, ownerId: userId });
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        throw AppError.conflict('You already have a workspace with this name');
      }
      throw err;
    }
  },

  async update(workspaceId: string, userId: string, input: UpdateWorkspaceInput) {
    await getOwnedWorkspaceOrThrow(workspaceId, userId);

    try {
      return await workspaceRepository.update(workspaceId, input);
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        throw AppError.conflict('You already have a workspace with this name');
      }
      throw err;
    }
  },

  async remove(workspaceId: string, userId: string): Promise<void> {
    const workspace = await getOwnedWorkspaceOrThrow(workspaceId, userId);

    // Best-effort: an orphaned container left behind by a failed removal
    // is still discoverable later via dockerService.findByWorkspaceId
    // (it's labeled), so we don't need to block deleting the DB row on
    // this succeeding.
    if (workspace.containerId) {
      await dockerService.remove(workspace.containerId).catch(() => {});
    }

    await workspaceRepository.delete(workspaceId);
  },

  /** Provisions (first run) or resumes (subsequent runs) this workspace's
   * container. Refuses to run if a start/stop/restart is already in
   * flight, or if the workspace is already running. */
  async start(workspaceId: string, userId: string): Promise<Workspace> {
    const workspace = await getOwnedWorkspaceOrThrow(workspaceId, userId);

    if (workspace.status === WorkspaceStatus.RUNNING) {
      throw AppError.conflict('Workspace is already running');
    }
    if (TRANSITIONAL_STATUSES.has(workspace.status)) {
      throw AppError.conflict(`Workspace is currently ${workspace.status.toLowerCase()} — try again shortly`);
    }

    await workspaceRepository.updateState(workspaceId, { status: WorkspaceStatus.STARTING });

    try {
      if (workspace.containerId) {
        // Resuming a workspace that was provisioned before and later
        // stopped — reuse the existing container rather than creating a
        // second one for the same workspace.
        await dockerService.start(workspace.containerId);
        return await workspaceRepository.updateState(workspaceId, { status: WorkspaceStatus.RUNNING });
      }

      const provisioned = await dockerService.createAndStart({ workspaceId });
      return await workspaceRepository.updateState(workspaceId, {
        status: WorkspaceStatus.RUNNING,
        containerId: provisioned.containerId,
        containerImage: provisioned.image
      });
    } catch (err) {
      await markErrored(workspaceId);
      throw err instanceof AppError ? err : AppError.internal('Failed to start workspace');
    }
  },

  async stop(workspaceId: string, userId: string): Promise<Workspace> {
    const workspace = await getOwnedWorkspaceOrThrow(workspaceId, userId);

    if (workspace.status === WorkspaceStatus.STOPPED) {
      throw AppError.conflict('Workspace is already stopped');
    }
    if (TRANSITIONAL_STATUSES.has(workspace.status)) {
      throw AppError.conflict(`Workspace is currently ${workspace.status.toLowerCase()} — try again shortly`);
    }

    // Nothing was ever provisioned (e.g. stopping straight from ERROR
    // before a first successful start) — no container to stop, just
    // reflect the state.
    if (!workspace.containerId) {
      return workspaceRepository.updateState(workspaceId, { status: WorkspaceStatus.STOPPED });
    }

    await workspaceRepository.updateState(workspaceId, { status: WorkspaceStatus.STOPPING });

    try {
      await dockerService.stop(workspace.containerId);
      return await workspaceRepository.updateState(workspaceId, { status: WorkspaceStatus.STOPPED });
    } catch (err) {
      await markErrored(workspaceId);
      throw err instanceof AppError ? err : AppError.internal('Failed to stop workspace');
    }
  },

  async restart(workspaceId: string, userId: string): Promise<Workspace> {
    const workspace = await getOwnedWorkspaceOrThrow(workspaceId, userId);

    if (!workspace.containerId) {
      throw AppError.conflict('Workspace has never been started — nothing to restart');
    }
    if (TRANSITIONAL_STATUSES.has(workspace.status)) {
      throw AppError.conflict(`Workspace is currently ${workspace.status.toLowerCase()} — try again shortly`);
    }

    await workspaceRepository.updateState(workspaceId, { status: WorkspaceStatus.STARTING });

    try {
      await dockerService.restart(workspace.containerId);
      return await workspaceRepository.updateState(workspaceId, { status: WorkspaceStatus.RUNNING });
    } catch (err) {
      await markErrored(workspaceId);
      throw err instanceof AppError ? err : AppError.internal('Failed to restart workspace');
    }
  }
};
