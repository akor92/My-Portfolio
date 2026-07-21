import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validate } from '../../middleware/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { postsController } from './posts.controller.js';
import {
  createPostSchema,
  listPostsQuery,
  postIdParam,
  postSlugParam,
  updatePostSchema,
} from './posts.schema.js';

// -------- Public --------
export const publicPostRoutes = Router();

publicPostRoutes.get(
  '/',
  validate({ query: listPostsQuery }),
  asyncHandler(postsController.listPublic),
);
publicPostRoutes.get(
  '/:slug',
  validate({ params: postSlugParam }),
  asyncHandler(postsController.getPublicBySlug),
);

// -------- Admin --------
export const adminPostRoutes = Router();
adminPostRoutes.use(authenticate, requireRole('ADMIN', 'EDITOR'));

adminPostRoutes.get('/', validate({ query: listPostsQuery }), asyncHandler(postsController.listAll));
adminPostRoutes.post('/', validate({ body: createPostSchema }), asyncHandler(postsController.create));
adminPostRoutes.get(
  '/:slug',
  validate({ params: postSlugParam }),
  asyncHandler(postsController.getBySlug),
);
adminPostRoutes.patch(
  '/:id',
  validate({ params: postIdParam, body: updatePostSchema }),
  asyncHandler(postsController.update),
);
adminPostRoutes.delete(
  '/:id',
  validate({ params: postIdParam }),
  asyncHandler(postsController.remove),
);
