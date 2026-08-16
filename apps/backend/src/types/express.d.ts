/**
 * PURPOSE: Augments Express's Request type with an optional `user` field
 * so `authenticate` middleware can attach the caller's identity and every
 * downstream controller gets it typed, instead of `(req as any).user`
 * scattered around the codebase.
 * DEPENDENCIES: express
 */

import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export {};
