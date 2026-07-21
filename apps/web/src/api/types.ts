export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR';
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  techStack: string[];
  repoUrl: string | null;
  liveUrl: string | null;
  imageUrl: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  tags: string[];
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  take: number;
  skip: number;
}

export type MessageList = Paginated<Message> & { unread: number };
