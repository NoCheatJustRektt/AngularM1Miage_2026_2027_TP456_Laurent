import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { AppError } from '../errors.js';
import { errorHandler } from './error-handler.middleware.js';
import { notFound } from './not-found.middleware.js';

function createTestApp() {
  const app = express();
  app.use(express.json({ limit: '1kb' }));
  app.get('/app-error', () => {
    throw new AppError(409, 'ALREADY_SHARED', 'Cette fiche est déjà partagée.', [
      { field: 'targetId', message: 'Déjà partagé' },
    ]);
  });
  app.get('/async-error', async () => {
    throw new AppError(403, 'FORBIDDEN', 'Accès refusé.');
  });
  app.get('/unexpected-error', () => {
    throw new Error('connexion perdue avec mot de passe secret');
  });
  app.post('/echo', (req, res) => {
    res.json(req.body);
  });
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

describe('errorHandler', () => {
  const app = createTestApp();

  it("renvoie le statut, le code, le message et les détails d'une AppError", async () => {
    const response = await request(app).get('/app-error');

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: {
        code: 'ALREADY_SHARED',
        message: 'Cette fiche est déjà partagée.',
        details: [{ field: 'targetId', message: 'Déjà partagé' }],
      },
    });
  });

  it('gère les erreurs levées dans une fonction asynchrone', async () => {
    const response = await request(app).get('/async-error');

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
    expect(response.body.error).not.toHaveProperty('details');
  });

  it('renvoie 500 INTERNAL_ERROR sans détail technique pour une erreur inattendue', async () => {
    const response = await request(app).get('/unexpected-error');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Une erreur inattendue est survenue.' },
    });
    expect(JSON.stringify(response.body)).not.toContain('secret');
  });

  it('renvoie 400 INVALID_JSON pour un corps JSON mal formé', async () => {
    const response = await request(app)
      .post('/echo')
      .set('Content-Type', 'application/json')
      .send('{"titre": ');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_JSON');
  });

  it('renvoie 413 PAYLOAD_TOO_LARGE pour un corps trop volumineux', async () => {
    const response = await request(app)
      .post('/echo')
      .send({ text: 'x'.repeat(2_000) });

    expect(response.status).toBe(413);
    expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });
});

describe('notFound', () => {
  it('renvoie 404 ROUTE_NOT_FOUND pour une route inexistante', async () => {
    const response = await request(createTestApp()).delete('/inexistante');

    expect(response.status).toBe(404);
    expect(response.body.error).toEqual({
      code: 'ROUTE_NOT_FOUND',
      message: 'Route introuvable : DELETE /inexistante',
    });
  });
});
