import type { Request, Response } from 'express';

import { validated } from '../../core/middlewares/validate.middleware.js';
import { healthQuerySchema } from './health.schemas.js';
import * as healthService from './health.service.js';

export async function getHealth(req: Request, res: Response): Promise<void> {
  const { deep } = validated(healthQuerySchema, req.query);
  if (!deep) {
    res.json(healthService.getBasicHealth());
    return;
  }
  const health = await healthService.getDeepHealth();
  res.status(health.status === 'ok' ? 200 : 503).json(health);
}
