import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validate } from '../../middleware/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { projectsController } from './projects.controller.js';
import {
  createProjectSchema,
  listProjectsQuery,
  projectIdParam,
  slugParam,
  updateProjectSchema,
} from './projects.schema.js';

// -------- Public (read-only, published content) --------
export const publicProjectRoutes = Router();

publicProjectRoutes.get(
  '/',
  validate({ query: listProjectsQuery }),
  asyncHandler(projectsController.listPublic),
);
publicProjectRoutes.get(
  '/:slug',
  validate({ params: slugParam }),
  asyncHandler(projectsController.getPublicBySlug),
);

// -------- Admin (full CRUD, requires auth) --------
export const adminProjectRoutes = Router();
adminProjectRoutes.use(authenticate, requireRole('ADMIN', 'EDITOR'));

adminProjectRoutes.get(
  '/',
  validate({ query: listProjectsQuery }),
  asyncHandler(projectsController.listAll),
);
adminProjectRoutes.post(
  '/',
  validate({ body: createProjectSchema }),
  asyncHandler(projectsController.create),
);
adminProjectRoutes.get(
  '/:slug',
  validate({ params: slugParam }),
  asyncHandler(projectsController.getBySlug),
);
adminProjectRoutes.patch(
  '/:id',
  validate({ params: projectIdParam, body: updateProjectSchema }),
  asyncHandler(projectsController.update),
);
adminProjectRoutes.delete(
  '/:id',
  validate({ params: projectIdParam }),
  asyncHandler(projectsController.remove),
);
