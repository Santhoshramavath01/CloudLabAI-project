/**
 * PURPOSE: Simple controlled tab list (e.g. workspace detail: Overview /
 * Logs / Settings). Active tab underline slides between tabs using a
 * shared framer-motion layoutId instead of a hard cut.
 * DEPENDENCIES: react, framer-motion, ../../utils/cn
 */

import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  const layoutId = useId();

  return (
    <div role="tablist" className={cn('flex items-center gap-1 border-b border-border-subtle', className)}>
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative px-4 py-2.5 text-sm font-medium transition-colors duration-micro',
              'disabled:cursor-not-allowed disabled:opacity-50',
              isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {item.label}
            {isActive && (
              <motion.span
                layoutId={`tabs-indicator-${layoutId}`}
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
