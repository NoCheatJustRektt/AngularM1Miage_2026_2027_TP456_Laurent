import { describe, expect, it } from 'vitest';

import { parseEnv } from './env.js';

describe('parseEnv', () => {
  it('applique les valeurs par défaut en développement', () => {
    const env = parseEnv({});

    expect(env).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      CORS_ORIGIN: 'http://localhost:4200',
      STORAGE_DRIVER: 'memory',
    });
  });

  it('convertit le port en nombre', () => {
    expect(parseEnv({ PORT: '8080' }).PORT).toBe(8080);
  });

  it('refuse un port invalide', () => {
    expect(() => parseEnv({ PORT: 'abc' })).toThrow(/PORT/);
  });

  it('refuse une chaîne MongoDB qui ne commence pas par mongodb://', () => {
    expect(() => parseEnv({ MONGODB_URI: 'http://exemple.fr' })).toThrow(/MONGODB_URI/);
  });

  it('accepte une chaîne MongoDB Atlas', () => {
    const uri = 'mongodb+srv://app:secret@cluster0.mongodb.net/studyshare';

    expect(parseEnv({ MONGODB_URI: uri }).MONGODB_URI).toBe(uri);
  });

  it('refuse un pilote de stockage inconnu', () => {
    expect(() => parseEnv({ STORAGE_DRIVER: 'ftp' })).toThrow(/STORAGE_DRIVER/);
  });

  it('exige MONGODB_URI et CORS_ORIGIN en production', () => {
    expect(() => parseEnv({ NODE_ENV: 'production' })).toThrow(/MONGODB_URI[\s\S]*CORS_ORIGIN/);
  });

  it('accepte une configuration de production complète', () => {
    const env = parseEnv({
      NODE_ENV: 'production',
      MONGODB_URI: 'mongodb+srv://app:secret@cluster0.mongodb.net/studyshare',
      CORS_ORIGIN: 'https://studyshare.onrender.com',
    });

    expect(env.CORS_ORIGIN).toBe('https://studyshare.onrender.com');
  });
});
