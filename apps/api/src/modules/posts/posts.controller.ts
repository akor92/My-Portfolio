import type { Request, Response } from 'express';
import { postsService } from './posts.service.js';

export const postsController = {
  async listPublic(req: Request, res: Response) {
    const data = await postsService.list(req.query as never, { onlyPublished: true });
    res.json(data);
  },

  async getPublicBySlug(req: Request, res: Response) {
    const post = await postsService.getBySlug(req.params.slug, { onlyPublished: true });
    res.json(post);
  },

  async listAll(req: Request, res: Response) {
    const data = await postsService.list(req.query as never, { onlyPublished: false });
    res.json(data);
  },

  async getBySlug(req: Request, res: Response) {
    const post = await postsService.getBySlug(req.params.slug, { onlyPublished: false });
    res.json(post);
  },

  async create(req: Request, res: Response) {
    const post = await postsService.create(req.body, req.user!.sub);
    res.status(201).json(post);
  },

  async update(req: Request, res: Response) {
    const post = await postsService.update(req.params.id, req.body);
    res.json(post);
  },

  async remove(req: Request, res: Response) {
    await postsService.remove(req.params.id);
    res.status(204).send();
  },
};
