/**
 * PURPOSE: Renders the global toast queue (see ../../store/toastStore) as
 * a stack of animated cards fixed to the viewport corner. Mounted once in
 * App.tsx — feature code never renders <Toast /> directly, it calls
 * `toast.success(...)` / `toast.error(...)` from the store.
 * DEPENDENCIES: react, framer-motion, lucide-react, ../../store/toastStore,
 * ../../utils/cn, ../../utils/motion
 */

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToastStore, type Toast as ToastData, type ToastVariant } from '../../store/toastStore';
import { cn } from '../../utils/cn';
import { toastVariants } from '../../utils/motion';

const variantConfig: Record<ToastVariant, { icon: typeof Info; classes: string }> = {
  success: { icon: CheckCircle2, classes: 'text-status-success' },
  error: { icon: AlertCircle, classes: 'text-status-danger' },
  warning: { icon: AlertTriangle, classes: 'text-status-warning' },
  info: { icon: Info, classes: 'text-status-info' }
};

function ToastItem({ toast }: { toast: ToastData }) {
  const dismiss = useToastStore((state) => state.dismiss);
  const { icon: Icon, classes } = variantConfig[toast.variant];

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="status"
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border-subtle bg-surface-overlay p-4 shadow-2xl"
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', classes)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-sm text-text-secondary">{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-md p-1 text-text-muted hover:bg-surface-base hover:text-text-primary"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-end gap-2 p-4 sm:inset-x-auto sm:right-0">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
