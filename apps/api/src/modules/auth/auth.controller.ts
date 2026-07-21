import type { Request, Response } from 'express';
import { authService } from './auth.service.js';

export const authController = {
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    res.json(result);
  },

  async me(req: Request, res: Response) {
    const user = await authService.me(req.user!.sub);
    res.json({ user });
  },
};
