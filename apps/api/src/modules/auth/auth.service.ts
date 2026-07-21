import { prisma } from '../../lib/prisma.js';
import { verifyPassword } from '../../utils/password.js';
import { signToken } from '../../utils/jwt.js';
import { Unauthorized, NotFound } from '../../utils/errors.js';
import type { LoginInput } from './auth.schema.js';

/** Public shape of a user (never exposes the password hash). */
function toPublicUser(user: { id: string; email: string; name: string; role: 'ADMIN' | 'EDITOR' }) {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export const authService = {
  async login({ email, password }: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Constant-ish failure path — same error whether email or password is wrong.
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw Unauthorized('Invalid email or password');
    }
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    return { token, user: toPublicUser(user) };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw NotFound('User not found');
    return toPublicUser(user);
  },
};
