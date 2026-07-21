import { z } from 'zod';

export const projectIdParam = z.object({ id: z.string().cuid() });
export const slugParam = z.object({ slug: z.string().min(1) });

export const listProjectsQuery = z.object({
  featured: z.enum(['true', 'false']).optional(),
  published: z.enum(['true', 'false']).optional(),
  take: z.coerce.number().int().min(1).max(100).default(50),
  skip: z.coerce.number().int().min(0).default(0),
});

export const createProjectSchema = z.object({
  title: z.string().min(2).max(120),
  summary: z.string().min(2).max(280),
  description: z.string().max(20000).default(''),
  techStack: z.array(z.string().min(1)).max(30).default([]),
  repoUrl: z.string().url().optional().or(z.literal('')),
  liveUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

// All fields optional on update.
export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuery>;
