/**
 * PURPOSE: Client-side form validation for workspace creation, mirroring
 * the backend's createWorkspaceSchema
 * (apps/backend/src/validators/workspace.validator.ts).
 * DEPENDENCIES: zod
 */

import { z } from 'zod';

export const createWorkspaceFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
  description: z.string().trim().max(500, 'Description must be 500 characters or fewer').optional()
});

export type CreateWorkspaceFormValues = z.infer<typeof createWorkspaceFormSchema>;
