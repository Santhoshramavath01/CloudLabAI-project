/**
 * PURPOSE: Route table for /api/v1/auth. Wires validation, rate limiting,
 * and authentication middleware around the thin authController handlers.
 * DEPENDENCIES: express, ../controllers/auth.controller,
 * ../middleware/validate, ../middleware/authenticate,
 * ../middleware/rateLimiter, ../validators/auth.validator,
 * ../utils/asyncHandler
 */

import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authLimiter } from '../middleware/rateLimiter';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import { asyncHandler } from '../utils/asyncHandler';

export const authRouter = Router();

authRouter.post('/register', authLimiter, validateBody(registerSchema), asyncHandler(authController.register));
authRouter.post('/login', authLimiter, validateBody(loginSchema), asyncHandler(authController.login));
authRouter.post('/refresh', asyncHandler(authController.refresh));
authRouter.post('/logout', asyncHandler(authController.logout));
authRouter.get('/me', authenticate, asyncHandler(authController.me));
