/**
 * PURPOSE: Modal form for creating a workspace. Built on the shared Modal
 * primitive (Phase 2.2/2.3) rather than a one-off dialog, with
 * react-hook-form + zod validation mirroring the backend schema.
 * DEPENDENCIES: react, react-hook-form, @hookform/resolvers/zod,
 * ../../../components/ui, ../../../utils/workspaceValidation
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Input, Textarea, Button } from '../../../components/ui';
import {
  createWorkspaceFormSchema,
  type CreateWorkspaceFormValues
} from '../../../utils/workspaceValidation';
import type { CreateWorkspacePayload } from '../../../api/workspace.api';
import type { Workspace } from '../../../types/workspace';

export interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: CreateWorkspacePayload) => Promise<Workspace>;
}

export function CreateWorkspaceModal({ isOpen, onClose, onCreate }: CreateWorkspaceModalProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateWorkspaceFormValues>({ resolver: zodResolver(createWorkspaceFormSchema) });

  function handleClose() {
    reset();
    setFormError(null);
    onClose();
  }

  async function onSubmit(values: CreateWorkspaceFormValues) {
    setFormError(null);
    try {
      await onCreate(values);
      reset();
      onClose();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to create workspace');
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create workspace"
      description="This creates the workspace record — you can start a cloud environment for it once the Docker module lands."
      closeOnBackdropClick={!isSubmitting}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" isLoading={isSubmitting} onClick={handleSubmit(onSubmit)}>
            Create workspace
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Name"
          placeholder="my-first-workspace"
          error={errors.name?.message}
          {...register('name')}
        />
        <Textarea
          label="Description"
          placeholder="What is this workspace for? (optional)"
          error={errors.description?.message}
          {...register('description')}
        />
        {formError && <p className="text-sm text-status-danger">{formError}</p>}
      </form>
    </Modal>
  );
}
