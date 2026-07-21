import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env.js';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: Role;
}

export function signToken(payload: JwtPayload): string {
  // expiresIn accepts a number (seconds) or a duration string like "1d";
  // env is validated to a string, cast to the library's expected type.
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
