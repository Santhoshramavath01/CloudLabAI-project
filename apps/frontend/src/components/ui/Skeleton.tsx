/**
 * PURPOSE: Loading placeholder for content that's still fetching (dashboard
 * stat tiles, workspace list, table rows). Shimmer animation is a CSS
 * keyframe (see styles/index.css) rather than framer-motion — it needs to
 * run indefinitely and cheaply for many rows at once, which CSS handles
 * better than a JS-driven loop.
 * DEPENDENCIES: react, ../../utils/cn
 */

import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'block' | 'circle';
}

export function Skeleton({ variant = 'block', className, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-shimmer rounded-md bg-gradient-to-r from-surface-overlay via-surface-raised to-surface-overlay bg-[length:200%_100%]',
        variant === 'text' && 'h-4 w-full rounded',
        variant === 'circle' && 'aspect-square rounded-full',
        variant === 'block' && 'h-24 w-full',
        className
      )}
      {...rest}
    />
  );
}

export interface SkeletonGroupProps {
  rows?: number;
  className?: string;
}

/** Convenience helper for stacked text-line skeletons (e.g. a loading list). */
export function SkeletonText({ rows = 3, className }: SkeletonGroupProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} variant="text" className={index === rows - 1 ? 'w-2/3' : undefined} />
      ))}
    </div>
  );
}
