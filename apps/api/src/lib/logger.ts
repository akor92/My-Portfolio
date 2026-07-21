import { env } from '../config/env.js';

/**
 * Tiny structured logger. Swappable for pino/winston later without touching
 * call sites. In production emits JSON lines; in dev emits readable text.
 */
type Level = 'info' | 'warn' | 'error' | 'debug';

function log(level: Level, message: string, meta?: Record<string, unknown>) {
  if (env.isTest) return;
  const time = new Date().toISOString();
  if (env.isProd) {
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](
      JSON.stringify({ time, level, message, ...meta }),
    );
  } else {
    const suffix = meta ? ` ${JSON.stringify(meta)}` : '';
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](`[${level.toUpperCase()}] ${message}${suffix}`);
  }
}

export const logger = {
  info: (m: string, meta?: Record<string, unknown>) => log('info', m, meta),
  warn: (m: string, meta?: Record<string, unknown>) => log('warn', m, meta),
  error: (m: string, meta?: Record<string, unknown>) => log('error', m, meta),
  debug: (m: string, meta?: Record<string, unknown>) => log('debug', m, meta),
};
