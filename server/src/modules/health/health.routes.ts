import { Router } from 'express';

import { validate } from '../../core/middlewares/validate.middleware.js';
import * as healthController from './health.controller.js';
import { healthQuerySchema } from './health.schemas.js';

export const healthRouter = Router();

healthRouter.get('/', validate({ query: healthQuerySchema }), healthController.getHealth);
