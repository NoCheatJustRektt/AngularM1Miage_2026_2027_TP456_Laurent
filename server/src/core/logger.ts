// Journalisation minimale. Ne jamais y passer de mot de passe, de jeton, de clé ni d'URL signée.
import { env } from '../config/env.js';

const isSilent = env.NODE_ENV === 'test';

export const logger = {
  info(message: string, ...context: unknown[]): void {
    if (!isSilent) console.info(message, ...context);
  },
  warn(message: string, ...context: unknown[]): void {
    if (!isSilent) console.warn(message, ...context);
  },
  error(message: string, ...context: unknown[]): void {
    if (!isSilent) console.error(message, ...context);
  },
};
