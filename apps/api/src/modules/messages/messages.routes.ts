import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validate } from '../../middleware/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { messagesController } from './messages.controller.js';
import {
  createMessageSchema,
  listMessagesQuery,
  messageIdParam,
  updateMessageSchema,
} from './messages.schema.js';

// Blunt spam: 5 submissions / 10 min per IP.
const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Please wait before sending again' } },
});

// -------- Public --------
export const publicMessageRoutes = Router();
publicMessageRoutes.post(
  '/',
  contactLimiter,
  validate({ body: createMessageSchema }),
  asyncHandler(messagesController.create),
);

// -------- Admin --------
export const adminMessageRoutes = Router();
adminMessageRoutes.use(authenticate, requireRole('ADMIN', 'EDITOR'));

adminMessageRoutes.get(
  '/',
  validate({ query: listMessagesQuery }),
  asyncHandler(messagesController.list),
);
adminMessageRoutes.patch(
  '/:id',
  validate({ params: messageIdParam, body: updateMessageSchema }),
  asyncHandler(messagesController.update),
);
adminMessageRoutes.delete(
  '/:id',
  validate({ params: messageIdParam }),
  asyncHandler(messagesController.remove),
);
