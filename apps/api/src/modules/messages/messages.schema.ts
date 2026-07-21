import { z } from 'zod';

export const messageIdParam = z.object({ id: z.string().cuid() });

export const listMessagesQuery = z.object({
  isRead: z.enum(['true', 'false']).optional(),
  take: z.coerce.number().int().min(1).max(100).default(50),
  skip: z.coerce.number().int().min(0).default(0),
});

export const createMessageSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  subject: z.string().max(200).default(''),
  body: z.string().min(1).max(5000),
  // Honeypot: bots fill hidden fields; humans leave it empty.
  website: z.string().max(0).optional(),
});

export const updateMessageSchema = z.object({ isRead: z.boolean() });

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type ListMessagesQuery = z.infer<typeof listMessagesQuery>;
