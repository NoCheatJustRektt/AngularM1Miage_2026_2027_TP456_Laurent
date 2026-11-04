import type { NextFunction, Request, Response } from 'express';

import type { ApiError } from '@studyshare/shared';

import { AppError } from '../errors.js';
import { logger } from '../logger.js';

// Erreurs levées par express.json() (bibliothèque body-parser).
const BODY_PARSER_ERRORS: Record<string, AppError> = {
  'entity.parse.failed': new AppError(
    400,
    'INVALID_JSON',
    "Le corps de la requête n'est pas un JSON valide.",
  ),
  'entity.too.large': new AppError(
    413,
    'PAYLOAD_TOO_LARGE',
    'Le corps de la requête est trop volumineux.',
  ),
};

function getBodyParserError(error: unknown): AppError | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    typeof error.type === 'string'
  ) {
    return BODY_PARSER_ERRORS[error.type];
  }
  return undefined;
}

function toResponseBody(error: AppError): ApiError {
  return {
    error: {
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    },
  };
}

/**
 * Transforme toute erreur en réponse JSON au format de l'API.
 * Les erreurs inattendues renvoient 500 sans aucun détail technique.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const knownError = error instanceof AppError ? error : getBodyParserError(error);
  if (knownError) {
    res.status(knownError.status).json(toResponseBody(knownError));
    return;
  }

  logger.error('Erreur inattendue', error);
  res
    .status(500)
    .json(
      toResponseBody(new AppError(500, 'INTERNAL_ERROR', 'Une erreur inattendue est survenue.')),
    );
}
