import type { Prisma } from '@prisma/client';
import { postsRepository } from './posts.repository.js';
import { slugify } from '../../utils/slug.js';
import { NotFound } from '../../utils/errors.js';
import type { CreatePostInput, ListPostsQuery, UpdatePostInput } from './posts.schema.js';

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || 'post';
  let slug = base;
  let n = 1;
  while (await postsRepository.findBySlug(slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export const postsService = {
  async list(query: ListPostsQuery, opts: { onlyPublished: boolean }) {
    const where: Prisma.PostWhereInput = {};
    if (opts.onlyPublished) where.published = true;
    else if (query.published) where.published = query.published === 'true';
    if (query.tag) where.tags = { has: query.tag };

    const [items, total] = await postsRepository.list(where, query.take, query.skip);
    return { items, total, take: query.take, skip: query.skip };
  },

  async getBySlug(slug: string, opts: { onlyPublished: boolean }) {
    const post = await postsRepository.findBySlug(slug);
    if (!post || (opts.onlyPublished && !post.published)) throw NotFound('Post not found');
    return post;
  },

  async create(input: CreatePostInput, authorId: string) {
    const slug = await uniqueSlug(input.title);
    return postsRepository.create({
      ...input,
      coverImage: input.coverImage || null,
      slug,
      publishedAt: input.published ? new Date() : null,
      author: { connect: { id: authorId } },
    });
  },

  async update(id: string, input: UpdatePostInput) {
    const existing = await postsRepository.findById(id);
    if (!existing) throw NotFound('Post not found');

    const slug =
      input.title && input.title !== existing.title ? await uniqueSlug(input.title) : undefined;

    // Stamp publishedAt the first time a post transitions to published.
    let publishedAt: Date | null | undefined;
    if (input.published === true && !existing.published) publishedAt = new Date();
    else if (input.published === false) publishedAt = null;

    return postsRepository.update(id, {
      ...input,
      coverImage: input.coverImage === undefined ? undefined : input.coverImage || null,
      ...(slug ? { slug } : {}),
      ...(publishedAt !== undefined ? { publishedAt } : {}),
    });
  },

  async remove(id: string) {
    const existing = await postsRepository.findById(id);
    if (!existing) throw NotFound('Post not found');
    await postsRepository.delete(id);
  },
};
