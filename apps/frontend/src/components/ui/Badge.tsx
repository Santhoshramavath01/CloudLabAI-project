/**
 * PURPOSE: Compact status/label pill used for workspace state, container
 * status, plan tier, etc. Colors map to the design system's status palette
 * so every "running/stopped/error" indicator looks the same everywhere.
 * DEPENDENCIES: react, ../../utils/cn
 */

import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type BadgeVariant = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-surface-overlay text-text-secondary',
  brand: 'bg-brand/10 text-brand',
  success: 'bg-status-success/10 text-status-success',
  warning: 'bg-status-warning/10 text-status-warning',
  danger: 'bg-status-danger/10 text-status-danger',
  info: 'bg-status-info/10 text-status-info'
};

const dotClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-text-muted',
  brand: 'bg-brand',
  success: 'bg-status-success',
  warning: 'bg-status-warning',
  danger: 'bg-status-danger',
  info: 'bg-status-info'
};

export function Badge({ variant = 'neutral', dot = false, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        variantClasses[variant],
        className
      )}
      {...rest}
    >
      {dot && <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotClasses[variant])} />}
      {children}
    </span>
  );
}
