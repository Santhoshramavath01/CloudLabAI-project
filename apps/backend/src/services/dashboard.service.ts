/**
 * PURPOSE: Aggregates the metrics the dashboard needs. Everything here is
 * a real, currently-observable signal (host CPU/memory via Node's `os`
 * module, actual DB/Redis/Docker connectivity) — nothing here is
 * fabricated. Workspace counts are intentionally NOT duplicated here: the
 * frontend already queries GET /api/v1/workspaces for the "recent
 * workspaces" panel (Phase 2.7) and derives a count from that same
 * react-query result, so there's exactly one source of truth for it
 * instead of two endpoints computing the same number.
 * DEPENDENCIES: os, ../config/database, ../config/redis, ../config/docker
 */

import os from 'os';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { checkDockerConnection, type DockerStatus } from '../config/docker';

export interface SystemMetrics {
  cpuCount: number;
  loadAverage1m: number;
  memoryTotalBytes: number;
  memoryFreeBytes: number;
  memoryUsedPercent: number;
  uptimeSeconds: number;
}

export interface InfraStatus {
  database: 'ok' | 'error';
  redis: 'ok' | 'error';
}

export interface DashboardSummary {
  system: SystemMetrics;
  docker: DockerStatus;
  infra: InfraStatus;
  generatedAt: string;
}

function getSystemMetrics(): SystemMetrics {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const [loadAverage1m] = os.loadavg();

  return {
    cpuCount: os.cpus().length,
    loadAverage1m,
    memoryTotalBytes: totalMem,
    memoryFreeBytes: freeMem,
    memoryUsedPercent: Math.round(((totalMem - freeMem) / totalMem) * 1000) / 10,
    uptimeSeconds: Math.round(process.uptime())
  };
}

async function getInfraStatus(): Promise<InfraStatus> {
  const [database, redisStatus] = await Promise.all([
    prisma
      .$queryRaw`SELECT 1`
      .then(() => 'ok' as const)
      .catch(() => 'error' as const),
    redis
      .ping()
      .then(() => 'ok' as const)
      .catch(() => 'error' as const)
  ]);

  return { database, redis: redisStatus };
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const [infra, dockerStatus] = await Promise.all([getInfraStatus(), checkDockerConnection()]);

    return {
      system: getSystemMetrics(),
      docker: dockerStatus,
      infra,
      generatedAt: new Date().toISOString()
    };
  }
};
