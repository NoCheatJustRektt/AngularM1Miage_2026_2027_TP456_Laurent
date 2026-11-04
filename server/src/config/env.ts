// Seul fichier du serveur qui lit process.env (voir docs/CONVENTIONS.md, « Back-end »).
import { existsSync } from 'node:fs';

import { z } from 'zod';

const DEFAULT_CORS_ORIGIN = 'http://localhost:4200';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
    MONGODB_URI: z
      .string()
      .regex(/^mongodb(\+srv)?:\/\//, 'Doit commencer par mongodb:// ou mongodb+srv://')
      .optional(),
    CORS_ORIGIN: z.url().optional(),
    STORAGE_DRIVER: z.enum(['memory']).default('memory'),
  })
  .superRefine((values, context) => {
    if (values.NODE_ENV !== 'production') {
      return;
    }
    for (const key of ['MONGODB_URI', 'CORS_ORIGIN'] as const) {
      if (!values[key]) {
        context.addIssue({ code: 'custom', path: [key], message: 'Obligatoire en production' });
      }
    }
  })
  .transform((values) => ({ ...values, CORS_ORIGIN: values.CORS_ORIGIN ?? DEFAULT_CORS_ORIGIN }));

export type Env = z.infer<typeof envSchema>;

/**
 * Valide les variables d'environnement et applique les valeurs par défaut.
 * Lève une erreur lisible si une variable manque ou est invalide, pour refuser de démarrer.
 */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Configuration invalide :\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

// En développement, le fichier server/.env est chargé s'il existe (jamais pendant les tests).
if (process.env['NODE_ENV'] !== 'test' && existsSync('.env')) {
  process.loadEnvFile('.env');
}

export const env = parseEnv(process.env);
