import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { errorHandler } from './core/middlewares/error-handler.middleware.js';
import { notFound } from './core/middlewares/not-found.middleware.js';
import { healthRouter } from './modules/health/health.routes.js';

/** Crée l'application Express sans la démarrer (utilisée telle quelle par les tests). */
export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: '100kb' }));

  app.use('/api/health', healthRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
