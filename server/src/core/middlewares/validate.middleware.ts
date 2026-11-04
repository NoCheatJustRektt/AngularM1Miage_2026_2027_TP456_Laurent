import type { RequestHandler } from 'express';
import { z, type ZodType } from 'zod';

import type { ApiErrorDetail } from '@studyshare/shared';

import { AppError } from '../errors.js';

// Messages de validation en français.
z.config(z.locales.fr());

interface ValidationSchemas {
  params?: ZodType;
  query?: ZodType;
  body?: ZodType;
}

const REQUEST_PARTS = ['params', 'query', 'body'] as const;

/**
 * Valide `params`, `query` et `body` avec les schémas Zod fournis.
 * Les valeurs validées (et converties) remplacent celles de la requête ;
 * en cas d'erreur, renvoie 400 VALIDATION_ERROR avec la liste des champs fautifs.
 */
export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req, _res, next) => {
    const details: ApiErrorDetail[] = [];

    for (const part of REQUEST_PARTS) {
      const schema = schemas[part];
      if (!schema) continue;

      const result = schema.safeParse(req[part]);
      if (!result.success) {
        details.push(
          ...result.error.issues.map((issue) => ({
            field: issue.path.length > 0 ? issue.path.join('.') : part,
            message: issue.message,
          })),
        );
        continue;
      }
      // Express 5 expose req.query en lecture seule : on redéfinit la propriété.
      Object.defineProperty(req, part, { value: result.data, writable: true, enumerable: true });
    }

    if (details.length > 0) {
      next(
        new AppError(
          400,
          'VALIDATION_ERROR',
          'La requête contient des données invalides.',
          details,
        ),
      );
      return;
    }
    next();
  };
}

/** Donne le type issu du schéma à une partie de requête déjà validée par `validate`. */
export function validated<TSchema extends ZodType>(
  _schema: TSchema,
  value: unknown,
): z.output<TSchema> {
  return value as z.output<TSchema>;
}
