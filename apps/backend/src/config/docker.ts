/**
 * PURPOSE: Single shared dockerode client, mirroring config/database.ts and
 * config/redis.ts. Used directly by the dashboard for a lightweight
 * connectivity check ("is the Docker daemon reachable?"). Actual container
 * lifecycle operations (create/start/stop/remove) go through
 * modules/docker/docker.service.ts instead of importing `docker` here
 * directly — that module is the only place workspace provisioning happens.
 * DEPENDENCIES: dockerode, ./env
 */

import Docker from 'dockerode';
import { env } from './env';

export const docker: Docker = env.DOCKER_HOST.startsWith('/')
  ? new Docker({ socketPath: env.DOCKER_HOST })
  : new Docker(); // falls back to dockerode's own DOCKER_HOST/tcp parsing

export interface DockerStatus {
  connected: boolean;
  version?: string;
}

/** Bounded so a slow/unreachable daemon never hangs the dashboard request
 * — dockerode has no built-in call timeout. */
export async function checkDockerConnection(timeoutMs = 1500): Promise<DockerStatus> {
  try {
    const info = await Promise.race([
      docker.version(),
      new Promise<never>((_resolve, reject) =>
        setTimeout(() => reject(new Error('Docker daemon check timed out')), timeoutMs)
      )
    ]);
    return { connected: true, version: info.Version };
  } catch {
    return { connected: false };
  }
}
