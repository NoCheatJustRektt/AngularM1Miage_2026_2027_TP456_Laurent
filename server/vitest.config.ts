import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    globalSetup: ['src/tests/global-setup.ts'],
    setupFiles: ['src/tests/setup.ts'],
    // Variables lues par config/env.ts pendant les tests : aucun service externe.
    env: {
      NODE_ENV: 'test',
      STORAGE_DRIVER: 'memory',
      CORS_ORIGIN: 'http://localhost:4200',
    },
    // Le premier lancement télécharge le binaire MongoDB utilisé par mongodb-memory-server.
    hookTimeout: 120_000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/tests/**', 'src/server.ts'],
      reporter: ['text', 'html'],
    },
  },
});
