# Rapport d'utilisation de l'IA

> Journal de tous les prompts envoyés à l'assistant IA (Claude Code) **pendant le développement** de StudyShare, avec leur horodatage et un compte rendu détaillé de chaque réponse.

## Fonctionnement

- **Début de la journalisation :** au lancement de l'étape 0 (mise en place). Les échanges de la phase de conception ne sont pas journalisés ; leur résultat est la documentation de `docs/`.
- **Enregistrement automatique :** un hook Claude Code (`.claude/hooks/log-prompt.mjs`, déclaré dans `.claude/settings.json`) ajoute chaque prompt **mot pour mot**, avec la date et l'heure de la machine, dès son envoi. Il est activé par `"enabled": true` dans `.claude/hooks/prompt-log.config.json`.
- **Compte rendu :** à la fin de chaque réponse, Claude remplace « À compléter par Claude » par le compte rendu, au format ci-dessous.
- **Numérotation :** les entrées sont numérotées dans l'ordre (`Prompt n°1`, `Prompt n°2`…). Ne pas modifier les titres, le hook s'en sert pour compter.

**État actuel :** ✅ journalisation **active** depuis le 2026-11-04 (début de l'étape 0). Le prompt n°1 a été ajouté à la main, le hook n'étant pas encore activé au moment de son envoi.

## Format d'une entrée

````markdown
## Prompt n°N — AAAA-MM-JJ HH:MM:SS

### Prompt

```text
Le prompt, mot pour mot.
```

### Compte rendu de la réponse

**Résumé :** ce que la réponse a fait, en une ou deux phrases.

**Étape :** n° et nom de l'étape (voir docs/ROADMAP.md).

**Actions réalisées :**
- …

**Fichiers créés ou modifiés :**
- `chemin/du/fichier` — ce qui a changé

**Décisions prises :** … (avec le numéro d'ADR s'il y en a une)

**Tests :** tests ajoutés, commande lancée, résultat (réussis / échoués).

**Points en suspens :** ce qui n'est pas fait ou pas vérifié, questions posées à l'utilisateur.
````

---

## Journal

---

## Prompt n°1 — 2026-11-04 19:04:29

### Prompt

````text
Lance l'étape 0 sur la mise en place du projet.
````

### Compte rendu de la réponse

**Résumé :** mise en place complète du projet : monorepo npm (`shared`, `server`, `client`), outillage commun, API Express minimale avec `GET /api/health`, application Angular 22 avec Material 3 et page d'accueil affichant l'état du serveur, 49 tests unitaires, intégration continue GitHub Actions.

**Étape :** 0 — Mise en place (branche `chore/00-project-setup`, créée depuis `develop`).

**Actions réalisées :**
- Activation de la journalisation des prompts (ce prompt ajouté à la main, le hook étant encore désactivé à son envoi).
- Constat : Angular 22.2 exige Node.js ≥ 22.22.3, la machine avait Node 22.19. Question posée à l'utilisateur, qui a choisi de laisser Claude mettre Node à jour : installation de **Node.js 26.13 LTS** avec `winget`.
- Génération du squelette Angular (`ng new`), puis adaptation aux conventions (composant racine `AppComponent`, OnPush, configuration déplacée à la racine).
- Écriture de la configuration racine : workspaces npm, `tsconfig.base.json`, ESLint (TypeScript, Angular, ordre des imports), Prettier, `.editorconfig`, `.gitignore`, `.gitattributes` (LF).
- Paquet `shared` : constantes (fichiers, fiches, pagination) et types (`ApiError`, `Paginated`, réponses de santé).
- Serveur : configuration validée par Zod, `AppError`, middlewares de validation, d'erreur et 404, connexion MongoDB (`sanitizeFilter`), stockage en mémoire derrière l'interface `StorageService`, module `health`, démarrage avec une base en mémoire si `MONGODB_URI` est absente.
- Client : thème Material 3, shell (barre + menu replié sur téléphone), `HealthApi`, page d'accueil, proxy `/api`, environnements.
- CI GitHub Actions (lint, tests, build, Node 26).
- Vérification dans le navigateur : la page d'accueil affiche « Le serveur répond. », sur ordinateur et sur téléphone.
- Correction : l'aperçu de Claude Code impose sa variable `PORT`, qui faisait démarrer l'API sur le port 4200. `.claude/launch.json` se contente désormais d'ouvrir http://localhost:4200, `npm run dev` étant lancé à part.

**Fichiers créés ou modifiés :**
- Racine : `package.json`, `package-lock.json`, `tsconfig.base.json`, `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `.editorconfig`, `.gitattributes`, `.gitignore`, `.github/workflows/ci.yml`, `.claude/launch.json`, `.claude/hooks/prompt-log.config.json` (activé), `.claude/hooks/*.mjs` (mise en forme Prettier seulement)
- `shared/` : `package.json`, `tsconfig.json`, `src/index.ts`, `src/constants/*.ts`, `src/types/*.ts`
- `server/` : `package.json`, `tsconfig*.json`, `vitest.config.ts`, `.env.example`, `src/app.ts`, `src/server.ts`, `src/config/env.ts`, `src/core/*`, `src/storage/*`, `src/modules/health/*`, `src/tests/*` et les fichiers `*.spec.ts`
- `client/` : squelette Angular, `angular.json`, `proxy.conf.json`, `src/styles.scss`, `src/index.html`, `src/environments/*`, `src/app/app.*`, `src/app/core/layout/shell/*`, `src/app/core/health/*`, `src/app/features/home/*`
- Documentation : `README.md`, `REPORT.md`, `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/APIs.md`, `docs/CONVENTIONS.md`, `docs/DECISIONS.md`, `docs/ROADMAP.md`, `docs/TESTS.md`, `docs/SECURITE.md`, `docs/FONCTIONNALITES.md`, `docs/DEPLOIEMENT.md`, `docs/RAPPORT_IA.md`

**Décisions prises :** ADR-017 (Node 26, Angular 22, TypeScript 6.0), ADR-018 (modules ES et paquet partagé compilé), ADR-019 (MongoDB en mémoire pour les tests et le développement). Réponse 503 de `/api/health?deep=1` au format `{ status, database, storage }`.

**Tests :** `npm run test:coverage` : serveur 38/38 (couverture des lignes 95,2 %), client 11/11 (97,0 %). `npm run lint` et `npm run build` passent.

**Points en suspens :**
- `npm audit` : 15 alertes « moderate » dues à `minimatch`, utilisé seulement par ESLint (outil de développement) ; pas de correction sans casser ESLint pour l'instant.
- L'adresse de l'API en production (`environment.ts`) est provisoire jusqu'à l'étape 8.
- La CI GitHub Actions n'a pas encore tourné : elle se lancera au premier push de la branche.
- Fusion de `chore/00-project-setup` dans `develop` : en attente de la validation de l'utilisateur.
