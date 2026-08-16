/**
 * PURPOSE: Frontend-side shape of GET /api/v1/dashboard/summary. Mirrors
 * DashboardSummary in apps/backend/src/services/dashboard.service.ts.
 * DEPENDENCIES: none
 */

export interface SystemMetrics {
  cpuCount: number;
  loadAverage1m: number;
  memoryTotalBytes: number;
  memoryFreeBytes: number;
  memoryUsedPercent: number;
  uptimeSeconds: number;
}

export interface DockerStatus {
  connected: boolean;
  version?: string;
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
