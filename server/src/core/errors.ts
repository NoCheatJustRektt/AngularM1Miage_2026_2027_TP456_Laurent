import type { ApiErrorDetail } from '@studyshare/shared';

/**
 * Erreur métier ou HTTP connue. Le middleware d'erreurs la transforme en réponse
 * `{ "error": { "code", "message", "details" } }` avec le statut HTTP indiqué.
 */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiErrorDetail[] | undefined;

  constructor(status: number, code: string, message: string, details?: ApiErrorDetail[]) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
