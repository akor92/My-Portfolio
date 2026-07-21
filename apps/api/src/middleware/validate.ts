import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { BadRequest } from '../utils/errors.js';

interface Schemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

/**
 * Validate request segments against Zod schemas. On success, replaces the
 * request segment with the parsed (typed, coerced) value so controllers can
 * trust their inputs.
 */
export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params) as typeof req.params;
      if (schemas.query) req.query = schemas.query.parse(req.query) as typeof req.query;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        throw BadRequest('Validation failed', err.flatten().fieldErrors);
      }
      throw err;
    }
  };
}
