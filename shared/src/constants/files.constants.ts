// Limites des fichiers attachés aux fiches (voir docs/MODELE_DONNEES.md, « Valeurs fixes »).

export const ACCEPTED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg'] as const;
export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number];

export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const MIN_FILES_PER_SHEET = 1;
export const MAX_FILES_PER_SHEET = 5;

export const USER_QUOTA_MB = 50;
export const USER_QUOTA_BYTES = USER_QUOTA_MB * 1024 * 1024;
