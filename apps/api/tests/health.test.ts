import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Mock Prisma so the app can boot without a real database in unit tests.
vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
  },
}));

// Provide required env before importing the app.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-secret-that-is-long-enough';

const { createApp } = await import('../src/app.js');
const app = createApp();

describe('GET /api/v1/health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('unknown route', () => {
  it('returns a structured 404', async () => {
    const res = await request(app).get('/api/v1/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('protected route', () => {
  it('rejects unauthenticated admin access', async () => {
    const res = await request(app).get('/api/v1/admin/projects');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
