// Valeurs fixes des fiches (voir docs/MODELE_DONNEES.md).

export const SHEET_STATUSES = ['draft', 'published', 'reported', 'archived'] as const;
export type SheetStatus = (typeof SHEET_STATUSES)[number];

export const SHEET_VISIBILITIES = ['public', 'private'] as const;
export type SheetVisibility = (typeof SHEET_VISIBILITIES)[number];

export const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2', 'other'] as const;
export type Level = (typeof LEVELS)[number];

export const SUBJECTS = [
  'computer-science',
  'mathematics',
  'management',
  'economics',
  'law',
  'languages',
  'physics',
  'chemistry',
  'biology',
  'other',
] as const;
export type Subject = (typeof SUBJECTS)[number];

export const SHEET_TITLE_MIN_LENGTH = 3;
export const SHEET_TITLE_MAX_LENGTH = 120;
export const SHEET_DESCRIPTION_MAX_LENGTH = 2000;
export const MAX_TAGS_PER_SHEET = 10;

/** Nombre de signalements ouverts à partir duquel une fiche passe à l'état « signalée ». */
export const REPORT_THRESHOLD = 3;
