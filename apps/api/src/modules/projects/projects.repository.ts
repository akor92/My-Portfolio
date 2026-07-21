import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

/**
 * Data-access layer for projects. The ONLY place that talks to Prisma for this
 * resource — swap in caching or read replicas here without touching services.
 */
export const projectsRepository = {
  list(where: Prisma.ProjectWhereInput, take: number, skip: number) {
    return prisma.$transaction([
      prisma.project.findMany({
        where,
        take,
        skip,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.project.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.project.findUnique({ where: { id } });
  },

  findBySlug(slug: string) {
    return prisma.project.findUnique({ where: { slug } });
  },

  create(data: Prisma.ProjectCreateInput) {
    return prisma.project.create({ data });
  },

  update(id: string, data: Prisma.ProjectUpdateInput) {
    return prisma.project.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.project.delete({ where: { id } });
  },
};
