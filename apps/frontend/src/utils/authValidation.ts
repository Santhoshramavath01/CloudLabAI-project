/**
 * PURPOSE: Client-side form validation for login/register, mirroring the
 * backend's Zod schemas (apps/backend/src/validators/auth.validator.ts) so
 * users get instant feedback instead of waiting on a round trip — the
 * backend still re-validates and is the actual source of truth.
 * DEPENDENCIES: zod
 */

import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const registerFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128)
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
