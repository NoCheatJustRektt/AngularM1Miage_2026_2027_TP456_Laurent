import mongoose from 'mongoose';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../../app.js';
import { getStorage } from '../../storage/index.js';

describe('GET /api/health', () => {
  const app = createApp();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("répond 200 avec l'état et la durée de fonctionnement", async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', uptime: expect.any(Number) });
  });

  it('ne demande pas de connexion', async () => {
    const response = await request(app).get('/api/health').set('Authorization', '');

    expect(response.status).toBe(200);
  });

  it('vérifie la base et le stockage avec deep=1', async () => {
    const response = await request(app).get('/api/health?deep=1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', database: 'ok', storage: 'ok' });
  });

  it('accepte aussi deep=true', async () => {
    const response = await request(app).get('/api/health?deep=true');

    expect(response.body.database).toBe('ok');
  });

  it('répond 503 si le stockage ne répond pas', async () => {
    vi.spyOn(getStorage(), 'isHealthy').mockRejectedValue(new Error('délai dépassé'));

    const response = await request(app).get('/api/health?deep=1');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: 'error', database: 'ok', storage: 'error' });
  });

  it('répond 503 si la base ne répond pas', async () => {
    const database = mongoose.connection.db;
    if (!database) throw new Error('La base de test devrait être connectée');
    vi.spyOn(database, 'admin').mockImplementation(() => {
      throw new Error('connexion perdue');
    });

    const response = await request(app).get('/api/health?deep=1');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: 'error', database: 'error', storage: 'ok' });
  });

  it('refuse une valeur de deep invalide', async () => {
    const response = await request(app).get('/api/health?deep=peut-etre');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details[0].field).toBe('deep');
  });
});
