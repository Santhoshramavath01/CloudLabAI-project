/**
 * PURPOSE: Standard "are you sure?" confirmation dialog (delete workspace,
 * stop container, log out everywhere, etc.) built on top of Modal so every
 * destructive action gets the same pattern instead of a bespoke confirm().
 * DEPENDENCIES: react, ./Modal, ./Button
 */

import { useState } from 'react';
import { Modal } from './Modal';
import { Button, type ButtonVariant } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Extract<ButtonVariant, 'primary' | 'danger'>;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger'
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    try {
      setIsSubmitting(true);
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      closeOnBackdropClick={!isSubmitting}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
          <Button variant={variant} size="sm" onClick={handleConfirm} isLoading={isSubmitting}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {null}
    </Modal>
  );
}
