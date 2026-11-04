// Réponse de GET /api/health (voir docs/APIs.md, « Santé »).

export type DependencyStatus = 'ok' | 'error';

export interface HealthResponse {
  status: 'ok';
  uptime: number;
}

export interface DeepHealthResponse {
  status: 'ok' | 'error';
  database: DependencyStatus;
  storage: DependencyStatus;
}
