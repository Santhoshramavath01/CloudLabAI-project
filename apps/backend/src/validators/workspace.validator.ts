/**
 * PURPOSE: Request-body validation for workspace endpoints, mirroring the
 * pattern in validators/auth.validator.ts.
 * DEPENDENCIES: zod
 */

import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or fewer'),
  description: z.string().trim().max(500, 'Description must be 500 characters or fewer').optional()
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'Provide at least one field to update'
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
