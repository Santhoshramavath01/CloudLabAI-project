/**
 * PURPOSE: Base dialog primitive for anything that needs to interrupt the
 * page (workspace creation, ConfirmDialog, future settings dialogs).
 * Owns backdrop click-to-close, Escape-to-close, body scroll lock, and the
 * enter/exit animation — feature dialogs only supply content.
 * DEPENDENCIES: react, react-dom, framer-motion, lucide-react,
 * ../../utils/cn, ../../utils/motion
 */

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { backdropVariants, modalVariants } from '../../utils/motion';

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  footer?: ReactNode;
  children: ReactNode;
  closeOnBackdropClick?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl'
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  footer,
  children,
  closeOnBackdropClick = true
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeOnBackdropClick ? onClose : undefined}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              'relative z-10 w-full rounded-2xl border border-border-subtle bg-surface-raised shadow-2xl',
              sizeClasses[size]
            )}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-6 py-4">
                <div>
                  {title && (
                    <h2 id="modal-title" className="text-base font-semibold text-text-primary">
                      {title}
                    </h2>
                  )}
                  {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-overlay hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="px-6 py-5">{children}</div>

            {footer && <div className="flex items-center justify-end gap-3 border-t border-border-subtle px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
