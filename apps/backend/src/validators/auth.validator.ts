/**
 * PURPOSE: Request-body validation schemas for the auth routes. Kept
 * separate from the controller so the shape of a valid request is defined
 * once and can be unit-tested independently of Express.
 * DEPENDENCIES: zod
 */

import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
  name: z.string().trim().min(1).max(100).optional()
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
