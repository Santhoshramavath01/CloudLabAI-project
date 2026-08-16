/**
 * PURPOSE: Landing page after login. Fetches real system/infra metrics
 * from GET /api/v1/dashboard/summary and assembles them from small
 * reusable pieces (StatCard, SystemStatusPanel, QuickActions,
 * RecentWorkspaces) rather than one large inline component.
 * RecentWorkspaces fetches real workspace data (Phase 2.7) under a shared
 * query key so it doesn't duplicate the WorkspacesPage's fetch.
 * DEPENDENCIES: react, @tanstack/react-query, framer-motion, lucide-react,
 * ../../api/dashboard.api, ../../store/authStore, ../../components/ui,
 * ../../constants/queryKeys, ../../utils/motion, ../../utils/format,
 * ./components/*
 */

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Cpu, MemoryStick, Clock, Container } from 'lucide-react';
import { dashboardApi } from '../../api/dashboard.api';
import { useAuthStore } from '../../store/authStore';
import { ErrorState } from '../../components/ui';
import { QUERY_KEYS } from '../../constants/queryKeys';
import { staggerContainer, staggerItem } from '../../utils/motion';
import { formatBytes, formatUptime } from '../../utils/format';
import { StatCard } from './components/StatCard';
import { SystemStatusPanel } from './components/SystemStatusPanel';
import { QuickActions } from './components/QuickActions';
import { RecentWorkspaces } from './components/RecentWorkspaces';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const {
    data: summary,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: QUERY_KEYS.dashboardSummary,
    queryFn: dashboardApi.getSummary,
    // Host metrics move fast enough that a minute-old snapshot is stale,
    // but not so fast this needs a websocket (that's Monitoring, later).
    refetchInterval: 30_000
  });

  const firstName = user?.name?.split(' ')[0] ?? user?.email?.split('@')[0];

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-semibold text-text-primary">
          {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Here&apos;s an overview of your cloud development environment.</p>
      </motion.div>

      {isError ? (
        <motion.div variants={staggerItem}>
          <ErrorState
            title="Couldn't load dashboard metrics"
            description="The backend may still be starting up, or the connection was interrupted."
            onRetry={() => void refetch()}
          />
        </motion.div>
      ) : (
        <>
          <motion.div variants={staggerItem} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="CPU load (1m)"
              value={summary ? summary.system.loadAverage1m.toFixed(2) : '—'}
              hint={summary ? `${summary.system.cpuCount} cores` : undefined}
              icon={<Cpu className="h-4 w-4" />}
              isLoading={isLoading}
            />
            <StatCard
              label="Memory used"
              value={summary ? `${summary.system.memoryUsedPercent}%` : '—'}
              hint={summary ? `of ${formatBytes(summary.system.memoryTotalBytes)}` : undefined}
              icon={<MemoryStick className="h-4 w-4" />}
              isLoading={isLoading}
            />
            <StatCard
              label="Backend uptime"
              value={summary ? formatUptime(summary.system.uptimeSeconds) : '—'}
              icon={<Clock className="h-4 w-4" />}
              isLoading={isLoading}
            />
            <StatCard
              label="Docker status"
              value={summary ? (summary.docker.connected ? 'Online' : 'Offline') : '—'}
              hint={summary?.docker.version ? `v${summary.docker.version}` : undefined}
              icon={<Container className="h-4 w-4" />}
              isLoading={isLoading}
            />
          </motion.div>

          <motion.div variants={staggerItem} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentWorkspaces />
            </div>
            <div className="space-y-4">
              <SystemStatusPanel summary={summary} isLoading={isLoading} />
              <QuickActions />
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
