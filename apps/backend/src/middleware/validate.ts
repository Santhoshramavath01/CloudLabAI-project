/**
 * PURPOSE: Generic Express middleware factory that validates `req.body`
 * against a Zod schema and replaces it with the parsed (typed, trimmed,
 * lower-cased where the schema says so) result. Every route that needs
 * body validation uses this instead of re-parsing inline in the
 * controller.
 * DEPENDENCIES: express, zod, ../utils/AppError
 */

import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(AppError.validation('Request body failed validation', result.error.flatten().fieldErrors));
      return;
    }

    req.body = result.data;
    next();
  };
}
