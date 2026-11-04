import { beforeEach, describe, expect, it } from 'vitest';

import { getStorage } from './index.js';
import { MemoryStorage } from './memory.storage.js';

describe('MemoryStorage', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('enregistre un fichier et son type', async () => {
    await storage.upload('users/u1/a.pdf', Buffer.from('%PDF-1.7'), 'application/pdf');

    expect(storage.get('users/u1/a.pdf')).toEqual({
      data: Buffer.from('%PDF-1.7'),
      contentType: 'application/pdf',
    });
  });

  it('remplace un fichier envoyé deux fois sous la même clé', async () => {
    await storage.upload('users/u1/a.png', Buffer.from('v1'), 'image/png');
    await storage.upload('users/u1/a.png', Buffer.from('v2'), 'image/png');

    expect(storage.get('users/u1/a.png')?.data.toString()).toBe('v2');
  });

  it('génère une URL de téléchargement avec le nom proposé et une expiration', async () => {
    await storage.upload('users/u1/a.pdf', Buffer.from('x'), 'application/pdf');

    const url = new URL(await storage.getDownloadUrl('users/u1/a.pdf', 'Fiche SQL.pdf', 300));

    expect(url.searchParams.get('download')).toBe('Fiche SQL.pdf');
    expect(Number(url.searchParams.get('expires'))).toBeGreaterThan(Date.now());
  });

  it("refuse de générer une URL pour un fichier qui n'existe pas", async () => {
    await expect(
      storage.getDownloadUrl('users/u1/absent.pdf', 'absent.pdf', 300),
    ).rejects.toThrow();
  });

  it('supprime des fichiers et ignore les clés inexistantes', async () => {
    await storage.upload('users/u1/a.pdf', Buffer.from('a'), 'application/pdf');
    await storage.upload('users/u1/b.pdf', Buffer.from('b'), 'application/pdf');

    await storage.delete(['users/u1/a.pdf', 'users/u1/inconnu.pdf']);

    expect(storage.get('users/u1/a.pdf')).toBeUndefined();
    expect(storage.get('users/u1/b.pdf')).toBeDefined();
  });

  it('se déclare disponible', async () => {
    expect(await storage.isHealthy()).toBe(true);
  });
});

describe('getStorage', () => {
  it('renvoie toujours la même instance, en mémoire pendant les tests', () => {
    expect(getStorage()).toBeInstanceOf(MemoryStorage);
    expect(getStorage()).toBe(getStorage());
  });
});
