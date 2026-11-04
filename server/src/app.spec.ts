import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from './app.js';

describe('createApp', () => {
  const app = createApp();

  it('ajoute les en-têtes de sécurité et masque Express', async () => {
    const response = await request(app).get('/api/health');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers).not.toHaveProperty('x-powered-by');
  });

  it("autorise l'origine du front (CORS)", async () => {
    const response = await request(app).get('/api/health').set('Origin', 'http://localhost:4200');

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:4200');
  });

  it("n'autorise pas une autre origine", async () => {
    const response = await request(app).get('/api/health').set('Origin', 'https://pirate.example');

    expect(response.headers['access-control-allow-origin']).not.toBe('https://pirate.example');
  });

  it('renvoie 404 ROUTE_NOT_FOUND au format JSON pour une route inconnue', async () => {
    const response = await request(app).get('/api/inconnue');

    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});
