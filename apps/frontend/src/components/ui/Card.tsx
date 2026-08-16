/**
 * PURPOSE: Base surface for grouped content (dashboard stat tiles,
 * workspace cards, settings sections). Plain by default; pass
 * `interactive` for clickable cards that should lift slightly on hover
 * (workspace list, quick-action tiles) using the shared cardHover motion
 * preset from the animation system.
 * DEPENDENCIES: react, framer-motion, ../../utils/cn, ../../utils/motion
 */

import type { HTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { cardHover } from '../../utils/motion';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
}

export function Card({ interactive = false, header, footer, className, children, ...rest }: CardProps) {
  const baseClasses = cn(
    'rounded-xl border border-border-subtle bg-surface-raised',
    interactive && 'cursor-pointer transition-colors duration-micro hover:border-border-strong',
    className
  );

  const content = (
    <>
      {header && <div className="border-b border-border-subtle px-5 py-4">{header}</div>}
      <div className="p-5">{children}</div>
      {footer && <div className="border-t border-border-subtle px-5 py-4">{footer}</div>}
    </>
  );

  if (interactive) {
    // framer-motion's event prop types (onDrag, onAnimationStart, ...) conflict
    // with the native HTMLAttributes versions in `rest`; safe to widen here
    // since we only ever forward DOM-safe props (id, role, onClick, aria-*, ...).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const motionSafeProps = rest as any;

    return (
      <motion.div className={baseClasses} whileHover={cardHover} {...motionSafeProps}>
        {content}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses} {...rest}>
      {content}
    </div>
  );
}
