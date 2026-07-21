import { z } from 'zod';

export const postIdParam = z.object({ id: z.string().cuid() });
export const postSlugParam = z.object({ slug: z.string().min(1) });

export const listPostsQuery = z.object({
  tag: z.string().optional(),
  published: z.enum(['true', 'false']).optional(),
  take: z.coerce.number().int().min(1).max(100).default(20),
  skip: z.coerce.number().int().min(0).default(0),
});

export const createPostSchema = z.object({
  title: z.string().min(2).max(160),
  excerpt: z.string().max(400).default(''),
  content: z.string().max(100000).default(''),
  coverImage: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string().min(1)).max(20).default([]),
  published: z.boolean().default(false),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuery>;
