import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../errors.js';

/** Dernière route : toute requête qui n'a trouvé aucune route aboutit ici. */
export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `Route introuvable : ${req.method} ${req.path}`));
}
