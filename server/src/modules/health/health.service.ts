import type { DeepHealthResponse, HealthResponse } from '@studyshare/shared';

import { isDatabaseHealthy } from '../../core/db.js';
import { getStorage } from '../../storage/index.js';

/** État simple du serveur : il répond. */
export function getBasicHealth(): HealthResponse {
  return { status: 'ok', uptime: process.uptime() };
}

/** Vérifie que MongoDB et le stockage répondent. */
export async function getDeepHealth(): Promise<DeepHealthResponse> {
  const [isDatabaseOk, isStorageOk] = await Promise.all([
    isDatabaseHealthy(),
    getStorage()
      .isHealthy()
      .catch(() => false),
  ]);
  return {
    status: isDatabaseOk && isStorageOk ? 'ok' : 'error',
    database: isDatabaseOk ? 'ok' : 'error',
    storage: isStorageOk ? 'ok' : 'error',
  };
}
