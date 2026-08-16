/**
 * PURPOSE: Generic click-triggered popover menu (user menu, row actions,
 * "..." context menus). Navbar's user menu is a good future consumer once
 * Phase 2.4 auth wiring lands. Owns its own open/close + outside-click/Escape
 * handling so pages don't reimplement it.
 * DEPENDENCIES: react, framer-motion, lucide-react, ../../utils/cn,
 * ../../utils/motion
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { dropdownVariants } from '../../utils/motion';

export interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, items, align = 'right', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <button type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-haspopup="menu">
        {trigger}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            variants={dropdownVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              'absolute z-30 mt-2 w-52 origin-top rounded-lg border border-border-subtle bg-surface-overlay p-1 shadow-xl',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onSelect();
                  setIsOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors duration-micro',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  item.danger
                    ? 'text-status-danger hover:bg-status-danger/10'
                    : 'text-text-secondary hover:bg-surface-base hover:text-text-primary'
                )}
              >
                {item.icon && <span className="inline-flex h-4 w-4 shrink-0 items-center">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
