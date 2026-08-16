/**
 * PURPOSE: Express 4 does not catch rejected promises from async route
 * handlers automatically — an awaited throw inside one becomes an
 * unhandled rejection instead of reaching errorHandler. Wrapping every
 * async controller in this once at the route level fixes that everywhere,
 * instead of a try/catch in every controller method.
 * DEPENDENCIES: express
 */

import type { NextFunction, Request, Response } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(handler: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}
