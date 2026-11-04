/**
 * Stockage des fichiers. Le reste du serveur ne connaît que cette interface :
 * Supabase en production (étape 2), mémoire pour les tests et le développement.
 * Les clés suivent le format `users/{userId}/{uuid}.{ext}` (voir docs/MODELE_DONNEES.md).
 */
export interface StorageService {
  /** Enregistre un fichier sous la clé donnée (remplace le fichier existant). */
  upload(key: string, data: Buffer, contentType: string): Promise<void>;

  /**
   * Renvoie une URL de téléchargement temporaire.
   * @param downloadName nom proposé au navigateur pour le fichier téléchargé
   * @param expiresInSeconds durée de validité de l'URL
   */
  getDownloadUrl(key: string, downloadName: string, expiresInSeconds: number): Promise<string>;

  /** Supprime les fichiers indiqués ; les clés inexistantes sont ignorées. */
  delete(keys: string[]): Promise<void>;

  /** Vrai si le stockage répond (utilisé par GET /api/health?deep=1). */
  isHealthy(): Promise<boolean>;
}
