import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './core/db.js';
import { logger } from './core/logger.js';

async function resolveMongoUri(): Promise<string> {
  if (env.MONGODB_URI) {
    return env.MONGODB_URI;
  }
  // En développement sans MONGODB_URI : base en mémoire (interdit en production par config/env.ts).
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const memoryServer = await MongoMemoryServer.create();
  logger.warn(
    "MONGODB_URI absente : base MongoDB en mémoire, les données seront perdues à l'arrêt.",
  );
  return memoryServer.getUri('studyshare-dev');
}

async function start(): Promise<void> {
  await connectDatabase(await resolveMongoUri());

  const server = createApp().listen(env.PORT, () => {
    logger.info(`API StudyShare démarrée sur http://localhost:${env.PORT}/api`);
  });

  const shutdown = async (): Promise<void> => {
    server.close();
    await disconnectDatabase();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
}

start().catch((error: unknown) => {
  logger.error("Impossible de démarrer l'API", error);
  process.exit(1);
});
