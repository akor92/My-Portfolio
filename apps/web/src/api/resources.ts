import { api } from './client.js';
import type {
  Message,
  MessageList,
  Paginated,
  Post,
  Project,
  User,
} from './types.js';

// ---- Auth ----
export const authApi = {
  login: (email: string, password: string) =>
    api<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  me: () => api<{ user: User }>('/auth/me', { auth: true }),
};

// ---- Public content ----
export const publicApi = {
  projects: () => api<Paginated<Project>>('/projects', { query: { take: 100 } }),
  project: (slug: string) => api<Project>(`/projects/${slug}`),
  posts: () => api<Paginated<Post>>('/posts', { query: { take: 50 } }),
  post: (slug: string) => api<Post>(`/posts/${slug}`),
  sendMessage: (body: { name: string; email: string; subject: string; body: string }) =>
    api<{ message: string }>('/messages', { method: 'POST', body }),
};

// ---- Admin: projects ----
export const adminProjects = {
  list: () => api<Paginated<Project>>('/admin/projects', { auth: true, query: { take: 100 } }),
  create: (data: Partial<Project>) =>
    api<Project>('/admin/projects', { method: 'POST', auth: true, body: data }),
  update: (id: string, data: Partial<Project>) =>
    api<Project>(`/admin/projects/${id}`, { method: 'PATCH', auth: true, body: data }),
  remove: (id: string) => api<void>(`/admin/projects/${id}`, { method: 'DELETE', auth: true }),
};

// ---- Admin: posts ----
export const adminPosts = {
  list: () => api<Paginated<Post>>('/admin/posts', { auth: true, query: { take: 100 } }),
  create: (data: Partial<Post>) =>
    api<Post>('/admin/posts', { method: 'POST', auth: true, body: data }),
  update: (id: string, data: Partial<Post>) =>
    api<Post>(`/admin/posts/${id}`, { method: 'PATCH', auth: true, body: data }),
  remove: (id: string) => api<void>(`/admin/posts/${id}`, { method: 'DELETE', auth: true }),
};

// ---- Admin: messages ----
export const adminMessages = {
  list: () => api<MessageList>('/admin/messages', { auth: true, query: { take: 100 } }),
  setRead: (id: string, isRead: boolean) =>
    api<Message>(`/admin/messages/${id}`, { method: 'PATCH', auth: true, body: { isRead } }),
  remove: (id: string) => api<void>(`/admin/messages/${id}`, { method: 'DELETE', auth: true }),
};
