import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`DevFolio API listening on http://localhost:${env.PORT}`, {
    env: env.NODE_ENV,
  });
});

// Graceful shutdown: stop accepting connections, then close the DB pool.
async function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Shutdown complete');
    process.exit(0);
  });
  // Force-exit if connections don't drain in time.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
