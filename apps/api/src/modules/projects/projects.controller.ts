import type { Request, Response } from 'express';
import { projectsService } from './projects.service.js';

export const projectsController = {
  // Public: only published projects.
  async listPublic(req: Request, res: Response) {
    const data = await projectsService.list(req.query as never, { onlyPublished: true });
    res.json(data);
  },

  async getPublicBySlug(req: Request, res: Response) {
    const project = await projectsService.getBySlug(req.params.slug, { onlyPublished: true });
    res.json(project);
  },

  // Admin: all projects, including drafts.
  async listAll(req: Request, res: Response) {
    const data = await projectsService.list(req.query as never, { onlyPublished: false });
    res.json(data);
  },

  async getBySlug(req: Request, res: Response) {
    const project = await projectsService.getBySlug(req.params.slug, { onlyPublished: false });
    res.json(project);
  },

  async create(req: Request, res: Response) {
    const project = await projectsService.create(req.body, req.user!.sub);
    res.status(201).json(project);
  },

  async update(req: Request, res: Response) {
    const project = await projectsService.update(req.params.id, req.body);
    res.json(project);
  },

  async remove(req: Request, res: Response) {
    await projectsService.remove(req.params.id);
    res.status(204).send();
  },
};
