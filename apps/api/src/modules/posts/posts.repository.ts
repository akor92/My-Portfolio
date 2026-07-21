import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

export const postsRepository = {
  list(where: Prisma.PostWhereInput, take: number, skip: number) {
    return prisma.$transaction([
      prisma.post.findMany({
        where,
        take,
        skip,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.post.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.post.findUnique({ where: { id } });
  },

  findBySlug(slug: string) {
    return prisma.post.findUnique({ where: { slug } });
  },

  create(data: Prisma.PostCreateInput) {
    return prisma.post.create({ data });
  },

  update(id: string, data: Prisma.PostUpdateInput) {
    return prisma.post.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.post.delete({ where: { id } });
  },
};
