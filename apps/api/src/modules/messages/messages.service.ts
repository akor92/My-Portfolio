import { prisma } from '../../lib/prisma.js';
import { NotFound } from '../../utils/errors.js';
import { logger } from '../../lib/logger.js';
import type { CreateMessageInput, ListMessagesQuery } from './messages.schema.js';

export const messagesService = {
  async create(input: CreateMessageInput) {
    // Honeypot tripped -> pretend success, drop the spam.
    if (input.website) {
      logger.warn('Honeypot triggered on contact form', { email: input.email });
      return { ok: true };
    }
    await prisma.message.create({
      data: {
        name: input.name,
        email: input.email,
        subject: input.subject,
        body: input.body,
      },
    });
    // Future: enqueue an email/Slack notification here.
    return { ok: true };
  },

  async list(query: ListMessagesQuery) {
    const where = query.isRead ? { isRead: query.isRead === 'true' } : {};
    const [items, total, unread] = await prisma.$transaction([
      prisma.message.findMany({
        where,
        take: query.take,
        skip: query.skip,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.message.count({ where }),
      prisma.message.count({ where: { isRead: false } }),
    ]);
    return { items, total, unread, take: query.take, skip: query.skip };
  },

  async setRead(id: string, isRead: boolean) {
    const existing = await prisma.message.findUnique({ where: { id } });
    if (!existing) throw NotFound('Message not found');
    return prisma.message.update({ where: { id }, data: { isRead } });
  },

  async remove(id: string) {
    const existing = await prisma.message.findUnique({ where: { id } });
    if (!existing) throw NotFound('Message not found');
    await prisma.message.delete({ where: { id } });
  },
};
