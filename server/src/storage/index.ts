import { env } from '../config/env.js';
import { MemoryStorage } from './memory.storage.js';
import type { StorageService } from './storage.js';

let storage: StorageService | undefined;

function createStorage(driver: typeof env.STORAGE_DRIVER): StorageService {
  switch (driver) {
    case 'memory':
      return new MemoryStorage();
  }
}

/** Le service de stockage choisi par STORAGE_DRIVER (une seule instance pour tout le serveur). */
export function getStorage(): StorageService {
  storage ??= createStorage(env.STORAGE_DRIVER);
  return storage;
}

export type { StorageService } from './storage.js';
