/**
 * PURPOSE: Global toast queue. Any part of the app (mutations, auth errors,
 * websocket events in later phases) can push a toast without being inside
 * the component tree that renders <ToastContainer />. Uses zustand since
 * it's already a project dependency and this is exactly the "small piece
 * of global UI state" it's meant for.
 * DEPENDENCIES: zustand
 */

import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Milliseconds before auto-dismiss. Defaults to 5000. */
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  show: (toast: ToastInput) => string;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (toast) => {
    const id = crypto.randomUUID();
    const next: Toast = {
      id,
      title: toast.title,
      description: toast.description,
      variant: toast.variant ?? 'info',
      duration: toast.duration ?? 5000
    };
    set((state) => ({ toasts: [...state.toasts, next] }));
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
}));

/** Convenience API mirroring common toast libraries:
 * `toast.success('Saved')`, `toast.error('Failed', { description: '...' })`. */
export const toast = {
  show: (input: ToastInput) => useToastStore.getState().show(input),
  success: (title: string, opts?: Omit<ToastInput, 'title' | 'variant'>) =>
    useToastStore.getState().show({ ...opts, title, variant: 'success' }),
  error: (title: string, opts?: Omit<ToastInput, 'title' | 'variant'>) =>
    useToastStore.getState().show({ ...opts, title, variant: 'error' }),
  info: (title: string, opts?: Omit<ToastInput, 'title' | 'variant'>) =>
    useToastStore.getState().show({ ...opts, title, variant: 'info' }),
  warning: (title: string, opts?: Omit<ToastInput, 'title' | 'variant'>) =>
    useToastStore.getState().show({ ...opts, title, variant: 'warning' }),
  dismiss: (id: string) => useToastStore.getState().dismiss(id)
};
