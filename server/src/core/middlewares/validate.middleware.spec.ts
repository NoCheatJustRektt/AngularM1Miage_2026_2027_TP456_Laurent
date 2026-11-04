import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { errorHandler } from './error-handler.middleware.js';
import { validate, validated } from './validate.middleware.js';

const querySchema = z.object({ page: z.coerce.number().int().min(1).default(1) });
const bodySchema = z.object({ title: z.string().min(3) });
const paramsSchema = z.object({ sheetId: z.string().regex(/^[0-9a-f]{24}$/) });

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.get('/sheets', validate({ query: querySchema }), (req, res) => {
    res.json(validated(querySchema, req.query));
  });
  app.post('/sheets/:sheetId', validate({ params: paramsSchema, body: bodySchema }), (req, res) => {
    res.json({ params: req.params, body: req.body });
  });
  app.use(errorHandler);
  return app;
}

describe('validate', () => {
  const app = createTestApp();

  it('remplace la requête par les valeurs validées et converties', async () => {
    const response = await request(app).get('/sheets?page=3');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ page: 3 });
  });

  it('applique les valeurs par défaut du schéma', async () => {
    const response = await request(app).get('/sheets');

    expect(response.body).toEqual({ page: 1 });
  });

  it('renvoie 400 VALIDATION_ERROR avec le champ fautif', async () => {
    const response = await request(app).get('/sheets?page=0');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details).toEqual([{ field: 'page', message: expect.any(String) }]);
  });

  it('regroupe les erreurs de plusieurs parties de la requête', async () => {
    const response = await request(app).post('/sheets/pas-un-id').send({ title: 'a' });

    expect(response.status).toBe(400);
    const fields = response.body.error.details.map((detail: { field: string }) => detail.field);
    expect(fields).toEqual(['sheetId', 'title']);
  });

  it('renvoie des messages en français', async () => {
    const response = await request(app)
      .post('/sheets/0123456789abcdef01234567')
      .send({ title: 'a' });

    expect(response.body.error.details[0].message).toMatch(/trop petit|caractères/i);
  });

  it('laisse passer une requête valide', async () => {
    const response = await request(app)
      .post('/sheets/0123456789abcdef01234567')
      .send({ title: 'Fiche SQL' });

    expect(response.status).toBe(200);
    expect(response.body.body).toEqual({ title: 'Fiche SQL' });
  });
});
