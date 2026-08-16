/**
 * PURPOSE: The ONLY place in the backend that talks to the Docker Engine
 * for container lifecycle operations (config/docker.ts still owns the
 * shared client + the dashboard's plain connectivity check — this module
 * owns everything that actually creates/starts/stops/removes containers).
 * workspace.service.ts is the only caller; nothing above it (controllers,
 * routes) and nothing in the frontend ever touches dockerode directly —
 * matches the Browser → Frontend → Backend API → Docker Service → Docker
 * Engine chain from the architecture doc.
 *
 * Every container this module creates is labeled with WORKSPACE_LABEL_KEY,
 * so a workspace's container can always be re-discovered from Docker
 * itself (via `findByWorkspaceId`) rather than trusting only the
 * `containerId` cached in Postgres — the two are kept in sync by the
 * caller, but if they ever drift, Docker's label is the source of truth.
 * DEPENDENCIES: dockerode, ../../config/docker, ../../config/env,
 * ../../config/logger, ../../utils/AppError, ./docker.types
 */

import type Docker from 'dockerode';
import { docker } from '../../config/docker';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { AppError } from '../../utils/AppError';
import {
  WORKSPACE_LABEL_KEY,
  type ContainerInspectResult,
  type ContainerLogsOptions,
  type CreateWorkspaceContainerInput,
  type DockerContainerState,
  type ProvisionedContainer
} from './docker.types';

/** No template/exec system exists yet (Phase 9/11), so the container just
 * needs to stay alive after `docker start` instead of running (and
 * immediately exiting after) a default CMD from the base image. */
const KEEP_ALIVE_CMD = ['tail', '-f', '/dev/null'];

function isDockerNotFoundError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'statusCode' in err && (err as { statusCode: unknown }).statusCode === 404;
}

function isDockerConflictError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'statusCode' in err && (err as { statusCode: unknown }).statusCode === 304;
}

function toWorkspaceContainerName(workspaceId: string): string {
  return `cloudlab-ws-${workspaceId}`;
}

function mapDockerState(state: string | undefined): DockerContainerState {
  switch (state) {
    case 'running':
    case 'exited':
    case 'created':
    case 'paused':
    case 'dead':
      return state;
    default:
      return 'unknown';
  }
}

/** Docker refuses to create a container from an image it doesn't have
 * locally yet — this pulls it first (a no-op if already cached) rather
 * than surfacing a confusing 404 from `createContainer` on a cold host. */
async function ensureImage(image: string): Promise<void> {
  const existing = await docker.listImages({ filters: { reference: [image] } });
  if (existing.length > 0) return;

  logger.info(`Pulling Docker image ${image} (not present locally)`);

  await new Promise<void>((resolve, reject) => {
    docker.pull(image, (pullErr: Error | null, stream?: NodeJS.ReadableStream) => {
      if (pullErr || !stream) {
        reject(pullErr ?? new Error(`docker.pull returned no stream for ${image}`));
        return;
      }
      docker.modem.followProgress(stream, (progressErr: Error | null) => {
        if (progressErr) reject(progressErr);
        else resolve();
      });
    });
  });
}

async function withDockerErrorHandling<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AppError) throw err;

    const code = typeof err === 'object' && err !== null && 'code' in err ? (err as { code?: string }).code : undefined;
    if (code === 'ENOENT' || code === 'ECONNREFUSED') {
      logger.error(`Docker daemon unreachable during ${operation}`, { code });
      throw AppError.serviceUnavailable('Docker daemon is unreachable. Is Docker running?');
    }

    logger.error(`Docker operation failed: ${operation}`, {
      message: err instanceof Error ? err.message : String(err)
    });
    throw AppError.internal(`Docker operation failed: ${operation}`);
  }
}

export const dockerService = {
  /** Finds this workspace's container by label rather than by a stored
   * ID, so a workspace whose `containerId` is missing/stale (e.g. after a
   * manual `docker rm` outside the platform) can still be located. */
  async findByWorkspaceId(workspaceId: string): Promise<Docker.ContainerInfo | null> {
    return withDockerErrorHandling('findByWorkspaceId', async () => {
      const containers = await docker.listContainers({
        all: true,
        filters: { label: [`${WORKSPACE_LABEL_KEY}=${workspaceId}`] }
      });
      return containers[0] ?? null;
    });
  },

  async createAndStart(input: CreateWorkspaceContainerInput): Promise<ProvisionedContainer> {
    const image = input.image ?? env.WORKSPACE_DEFAULT_IMAGE;
    const cpuLimit = input.cpuLimit ?? env.WORKSPACE_CONTAINER_CPU_LIMIT;
    const memoryMb = input.memoryMb ?? env.WORKSPACE_CONTAINER_MEMORY_MB;

    return withDockerErrorHandling('createAndStart', async () => {
      await ensureImage(image);

      const container = await docker.createContainer({
        name: toWorkspaceContainerName(input.workspaceId),
        Image: image,
        Cmd: KEEP_ALIVE_CMD,
        Tty: true,
        Labels: {
          [WORKSPACE_LABEL_KEY]: input.workspaceId,
          'cloudlab.managed': 'true'
        },
        HostConfig: {
          // NanoCpus is dockerode's unit for `--cpus` (1 core = 1e9).
          NanoCpus: Math.round(cpuLimit * 1_000_000_000),
          Memory: memoryMb * 1024 * 1024,
          RestartPolicy: { Name: 'no' }
        }
      });

      await container.start();

      return { containerId: container.id, image };
    });
  },

  /** Starts a container that was already provisioned by `createAndStart`
   * in an earlier session (e.g. a workspace being resumed after `stop`).
   * Kept separate from `createAndStart` so resuming a stopped workspace
   * never re-runs image pull / container creation against an existing
   * container. */
  async start(containerId: string): Promise<void> {
    return withDockerErrorHandling('start', async () => {
      try {
        await docker.getContainer(containerId).start();
      } catch (err) {
        // 304 = already running; start() should be idempotent too.
        if (!isDockerConflictError(err)) throw err;
      }
    });
  },

  async stop(containerId: string): Promise<void> {
    return withDockerErrorHandling('stop', async () => {
      try {
        await docker.getContainer(containerId).stop({ t: 10 });
      } catch (err) {
        // 304 = already stopped; not an error from the caller's
        // perspective (stop() should be idempotent).
        if (!isDockerConflictError(err)) throw err;
      }
    });
  },

  async restart(containerId: string): Promise<void> {
    return withDockerErrorHandling('restart', async () => {
      await docker.getContainer(containerId).restart({ t: 10 });
    });
  },

  async remove(containerId: string): Promise<void> {
    return withDockerErrorHandling('remove', async () => {
      try {
        await docker.getContainer(containerId).remove({ force: true });
      } catch (err) {
        // Already gone — removal is idempotent from the caller's side.
        if (!isDockerNotFoundError(err)) throw err;
      }
    });
  },

  async inspect(containerId: string): Promise<ContainerInspectResult | null> {
    return withDockerErrorHandling('inspect', async () => {
      try {
        const data = await docker.getContainer(containerId).inspect();
        return {
          containerId: data.Id,
          state: mapDockerState(data.State?.Status),
          startedAt: data.State?.StartedAt && data.State.StartedAt !== '0001-01-01T00:00:00Z' ? data.State.StartedAt : null,
          finishedAt: data.State?.FinishedAt && data.State.FinishedAt !== '0001-01-01T00:00:00Z' ? data.State.FinishedAt : null
        };
      } catch (err) {
        if (isDockerNotFoundError(err)) return null;
        throw err;
      }
    });
  },

  async getLogs(containerId: string, options: ContainerLogsOptions = {}): Promise<string> {
    return withDockerErrorHandling('getLogs', async () => {
      const buffer = (await docker.getContainer(containerId).logs({
        stdout: true,
        stderr: true,
        tail: options.tail ?? 200,
        timestamps: false
        // No `follow` — this is a point-in-time read for the Overview/AI
        // context use case. Streaming logs to the browser is WebSocket
        // territory (Docker management phase), not this module.
      })) as unknown as Buffer;

      // Container was created with Tty: true, so the log stream is plain
      // text (no stdout/stderr multiplexing frame to strip).
      return buffer.toString('utf-8');
    });
  }
};
