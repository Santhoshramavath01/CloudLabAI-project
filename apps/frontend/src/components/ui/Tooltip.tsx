/**
 * PURPOSE: Lightweight hover/focus tooltip for icon-only buttons and
 * truncated labels across the app (sidebar collapsed state later, table
 * actions, status badges). Pure CSS positioning + framer-motion fade,
 * no floating-ui dependency needed at this scale.
 * DEPENDENCIES: react, framer-motion, ../../utils/cn, ../../utils/motion
 */

import { useId, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { tooltipVariants } from '../../utils/motion';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  className?: string;
}

const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2'
};

export function Tooltip({ content, children, position = 'top', className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      <span aria-describedby={tooltipId}>{children}</span>

      <AnimatePresence>
        {isVisible && (
          <motion.span
            id={tooltipId}
            role="tooltip"
            variants={tooltipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              'pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-border-subtle bg-surface-overlay px-2.5 py-1.5 text-xs font-medium text-text-primary shadow-lg',
              positionClasses[position],
              className
            )}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
