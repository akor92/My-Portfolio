import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@prisma/client';
import { verifyToken, type JwtPayload } from '../utils/jwt.js';
import { Forbidden, Unauthorized } from '../utils/errors.js';

// Augment Express Request with the authenticated user.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/** Require a valid Bearer token; attaches `req.user`. */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw Unauthorized('Missing or malformed Authorization header');
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    throw Unauthorized('Invalid or expired token');
  }
}

/** Require the authenticated user to hold one of the given roles. */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw Unauthorized();
    if (!roles.includes(req.user.role)) throw Forbidden();
    next();
  };
}
