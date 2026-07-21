import type { Request, Response } from 'express';
import { messagesService } from './messages.service.js';

export const messagesController = {
  // Public: submit a contact message.
  async create(req: Request, res: Response) {
    await messagesService.create(req.body);
    res.status(201).json({ message: 'Thanks — your message has been sent.' });
  },

  // Admin: inbox.
  async list(req: Request, res: Response) {
    const data = await messagesService.list(req.query as never);
    res.json(data);
  },

  async update(req: Request, res: Response) {
    const message = await messagesService.setRead(req.params.id, req.body.isRead);
    res.json(message);
  },

  async remove(req: Request, res: Response) {
    await messagesService.remove(req.params.id);
    res.status(204).send();
  },
};
