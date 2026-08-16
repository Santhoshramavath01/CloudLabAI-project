/**
 * PURPOSE: Small inline loading indicator reused by Button, page-level
 * loaders, and async sections instead of every feature drawing its own.
 * DEPENDENCIES: react, ../../utils/cn
 */

import { cn } from '../../utils/cn';

export type SpinnerSize = 'sm' | 'md' | 'lg';

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-9 w-9 border-[3px]'
};

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full border-current border-t-transparent text-brand',
        sizeClasses[size],
        className
      )}
    />
  );
}
