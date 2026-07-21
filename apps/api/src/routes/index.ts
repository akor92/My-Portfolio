import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { publicProjectRoutes, adminProjectRoutes } from '../modules/projects/projects.routes.js';
import { publicPostRoutes, adminPostRoutes } from '../modules/posts/posts.routes.js';
import { publicMessageRoutes, adminMessageRoutes } from '../modules/messages/messages.routes.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * API v1 router. Mounted at /api/v1.
 * Public routes serve published content and the contact form.
 * Admin routes (under /admin) require a valid JWT.
 */
export const apiRouter = Router();

// Health / readiness — checks DB connectivity.
apiRouter.get(
  '/health',
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', time: new Date().toISOString() });
  }),
);

// Auth
apiRouter.use('/auth', authRoutes);

// Public (read + contact)
apiRouter.use('/projects', publicProjectRoutes);
apiRouter.use('/posts', publicPostRoutes);
apiRouter.use('/messages', publicMessageRoutes);

// Admin (protected CRUD)
apiRouter.use('/admin/projects', adminProjectRoutes);
apiRouter.use('/admin/posts', adminPostRoutes);
apiRouter.use('/admin/messages', adminMessageRoutes);
