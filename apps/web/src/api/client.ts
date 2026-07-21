/**
 * Thin typed fetch wrapper around the DevFolio API.
 * - Prefixes every path with the API base + /api/v1
 * - Attaches the stored JWT on requests
 * - Normalizes error responses into a thrown ApiError
 */
const BASE = (import.meta.env.VITE_API_BASE_URL ?? '') + '/api/v1';
const TOKEN_KEY = 'devfolio_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = new URL(BASE + path, window.location.origin);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.auth) {
    const token = tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url.toString().replace(window.location.origin, ''), {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = data.error ?? {};
    if (res.status === 401) tokenStore.clear();
    throw new ApiError(res.status, err.code ?? 'ERROR', err.message ?? 'Request failed', err.details);
  }
  return data as T;
}
