import type { StorageService } from './storage.js';

interface StoredFile {
  data: Buffer;
  contentType: string;
}

/** Stockage en mémoire, pour les tests et le développement sans compte cloud. */
export class MemoryStorage implements StorageService {
  private readonly files = new Map<string, StoredFile>();

  async upload(key: string, data: Buffer, contentType: string): Promise<void> {
    this.files.set(key, { data: Buffer.from(data), contentType });
  }

  async getDownloadUrl(
    key: string,
    downloadName: string,
    expiresInSeconds: number,
  ): Promise<string> {
    if (!this.files.has(key)) {
      throw new Error(`Fichier absent du stockage : ${key}`);
    }
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    const query = new URLSearchParams({ download: downloadName, expires: String(expiresAt) });
    return `memory://${encodeURIComponent(key)}?${query.toString()}`;
  }

  async delete(keys: string[]): Promise<void> {
    for (const key of keys) {
      this.files.delete(key);
    }
  }

  async isHealthy(): Promise<boolean> {
    return true;
  }

  /** Pour les tests : le fichier stocké sous cette clé, s'il existe. */
  get(key: string): StoredFile | undefined {
    return this.files.get(key);
  }

  /** Pour les tests : vide le stockage. */
  clear(): void {
    this.files.clear();
  }
}
