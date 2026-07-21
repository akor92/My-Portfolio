import type { NextFunction, Request, Response } from 'express';

/**
 * Wraps async route handlers so rejected promises are forwarded to Express's
 * error middleware instead of crashing the process or hanging the request.
 */
export const asyncHandler =
  <T extends (req: Request, res: Response, next: NextFunction) => Promise<unknown>>(fn: T) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
