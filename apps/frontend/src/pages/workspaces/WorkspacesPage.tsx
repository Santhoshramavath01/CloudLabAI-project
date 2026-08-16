/**
 * PURPOSE: Full workspace list page (sidebar "Workspaces" destination).
 * Fetches via react-query using the shared QUERY_KEYS.workspaces key (so
 * this shares a cache entry with the dashboard's "Recent workspaces"
 * panel), and renders grid/loading/empty states from small reusable
 * pieces rather than one large inline component. Phase 2.12 adds the
 * start/stop/restart mutations backing each card's lifecycle buttons.
 * DEPENDENCIES: react, @tanstack/react-query, framer-motion, lucide-react,
 * ../../api/workspace.api, ../../components/ui, ../../constants/queryKeys,
 * ../../utils/motion, ./components/*
 */

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { workspaceApi, type CreateWorkspacePayload } from '../../api/workspace.api';
import { Button, EmptyState, ErrorState, Skeleton } from '../../components/ui';
import { toast } from '../../store/toastStore';import { QUERY_KEYS } from '../../constants/queryKeys';
import { staggerContainer, staggerItem } from '../../utils/motion';
import { WorkspaceCard } from './components/WorkspaceCard';
import { CreateWorkspaceModal } from './components/CreateWorkspaceModal';

export default function WorkspacesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  // Tracks which single workspace has a lifecycle mutation in flight, so
  // only that card's buttons disable — starting one workspace shouldn't
  // freeze the whole grid.
  const [pendingWorkspaceId, setPendingWorkspaceId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: workspaces,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: QUERY_KEYS.workspaces,
    queryFn: workspaceApi.list
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateWorkspacePayload) => workspaceApi.create(payload),
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workspaces });
      toast.success('Workspace created', { description: workspace.name });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => workspaceApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workspaces });
      toast.success('Workspace deleted');
    },
    onError: (error) => {
      toast.error('Could not delete workspace', {
        description: error instanceof Error ? error.message : undefined
      });
    }
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => workspaceApi.start(id),
    onMutate: (id) => setPendingWorkspaceId(id),
    onSettled: () => setPendingWorkspaceId(null),
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workspaces });
      toast.success('Workspace started', { description: workspace.name });
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workspaces });
      toast.error('Could not start workspace', {
        description: error instanceof Error ? error.message : undefined
      });
    }
  });

  const stopMutation = useMutation({
    mutationFn: (id: string) => workspaceApi.stop(id),
    onMutate: (id) => setPendingWorkspaceId(id),
    onSettled: () => setPendingWorkspaceId(null),
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workspaces });
      toast.success('Workspace stopped', { description: workspace.name });
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workspaces });
      toast.error('Could not stop workspace', {
        description: error instanceof Error ? error.message : undefined
      });
    }
  });

  const restartMutation = useMutation({
    mutationFn: (id: string) => workspaceApi.restart(id),
    onMutate: (id) => setPendingWorkspaceId(id),
    onSettled: () => setPendingWorkspaceId(null),
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workspaces });
      toast.success('Workspace restarted', { description: workspace.name });
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workspaces });
      toast.error('Could not restart workspace', {
        description: error instanceof Error ? error.message : undefined
      });
    }
  });

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Workspaces</h1>
          <p className="mt-1 text-sm text-text-secondary">Cloud development environments for your projects.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New workspace
        </Button>
      </motion.div>

      {isError && (
        <motion.div variants={staggerItem}>
          <ErrorState title="Couldn't load workspaces" onRetry={() => void refetch()} />
        </motion.div>
      )}

      {isLoading && (
        <motion.div variants={staggerItem} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </motion.div>
      )}

      {!isLoading && !isError && workspaces && workspaces.length === 0 && (
        <motion.div variants={staggerItem}>
          <EmptyState
            title="No workspaces yet"
            description="Create your first workspace to get started."
            actionLabel="New workspace"
            onAction={() => setIsCreateOpen(true)}
          />
        </motion.div>
      )}

      {!isLoading && !isError && workspaces && workspaces.length > 0 && (
        <motion.div variants={staggerItem} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              onDelete={(id) => deleteMutation.mutateAsync(id)}
              onStart={(id) => startMutation.mutateAsync(id)}
              onStop={(id) => stopMutation.mutateAsync(id)}
              onRestart={(id) => restartMutation.mutateAsync(id)}
              isLifecycleActionPending={pendingWorkspaceId === workspace.id}
            />
          ))}
        </motion.div>
      )}

      <CreateWorkspaceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={(payload) => createMutation.mutateAsync(payload)}
      />
    </motion.div>
  );
}
