import type { Prisma } from '@prisma/client';
import { projectsRepository } from './projects.repository.js';
import { slugify } from '../../utils/slug.js';
import { NotFound } from '../../utils/errors.js';
import type {
  CreateProjectInput,
  ListProjectsQuery,
  UpdateProjectInput,
} from './projects.schema.js';

/** Strip empty-string URLs down to null so the DB stays clean. */
function normalizeUrls<T extends { repoUrl?: string; liveUrl?: string; imageUrl?: string }>(input: T) {
  return {
    ...input,
    repoUrl: input.repoUrl || null,
    liveUrl: input.liveUrl || null,
    imageUrl: input.imageUrl || null,
  };
}

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || 'project';
  let slug = base;
  let n = 1;
  while (await projectsRepository.findBySlug(slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export const projectsService = {
  async list(query: ListProjectsQuery, opts: { onlyPublished: boolean }) {
    const where: Prisma.ProjectWhereInput = {};
    if (opts.onlyPublished) where.published = true;
    else if (query.published) where.published = query.published === 'true';
    if (query.featured) where.featured = query.featured === 'true';

    const [items, total] = await projectsRepository.list(where, query.take, query.skip);
    return { items, total, take: query.take, skip: query.skip };
  },

  async getBySlug(slug: string, opts: { onlyPublished: boolean }) {
    const project = await projectsRepository.findBySlug(slug);
    if (!project || (opts.onlyPublished && !project.published)) throw NotFound('Project not found');
    return project;
  },

  async create(input: CreateProjectInput, authorId: string) {
    const slug = await uniqueSlug(input.title);
    return projectsRepository.create({
      ...normalizeUrls(input),
      slug,
      author: { connect: { id: authorId } },
    });
  },

  async update(id: string, input: UpdateProjectInput) {
    const existing = await projectsRepository.findById(id);
    if (!existing) throw NotFound('Project not found');
    // Re-slug only if the title changed.
    const slug =
      input.title && input.title !== existing.title ? await uniqueSlug(input.title) : undefined;
    return projectsRepository.update(id, { ...normalizeUrls(input), ...(slug ? { slug } : {}) });
  },

  async remove(id: string) {
    const existing = await projectsRepository.findById(id);
    if (!existing) throw NotFound('Project not found');
    await projectsRepository.delete(id);
  },
};
