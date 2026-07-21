import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

/**
 * Single shared PrismaClient instance.
 * Reused across hot reloads in dev to avoid exhausting DB connections.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isProd ? ['error'] : ['warn', 'error'],
  });

if (!env.isProd) globalForPrisma.prisma = prisma;
