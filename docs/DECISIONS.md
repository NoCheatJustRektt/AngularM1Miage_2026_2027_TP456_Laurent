# Journal des décisions techniques

> Chaque choix important est noté sous forme d'**ADR** (*Architecture Decision Record*) : le contexte, les options étudiées, la décision et ses conséquences.
> Une décision n'est jamais effacée : si elle change, une nouvelle ADR la **remplace** et l'ancienne passe à l'état « Remplacée ».

## Sommaire

| N° | Décision | Date | État |
|---|---|---|---|
| [001](#adr-001--sujet--studyshare) | Sujet : StudyShare | 2026-11-04 | Acceptée |
| [002](#adr-002--typescript-partout-workspaces-npm-et-types-partagés) | TypeScript partout, workspaces npm et types partagés | 2026-11-04 | Acceptée |
| [003](#adr-003--découpage-par-fonctionnalité-front-et-back) | Découpage par fonctionnalité, front et back | 2026-11-04 | Acceptée |
| [004](#adr-004--mongodb-atlas-et-mongoose) | MongoDB Atlas et Mongoose | 2026-11-04 | Acceptée |
| [005](#adr-005--hébergement-sur-render) | Hébergement sur Render | 2026-11-04 | Acceptée |
| [006](#adr-006--stockage-des-fichiers-sur-supabase-storage) | Stockage des fichiers sur Supabase Storage | 2026-11-04 | Acceptée |
| [007](#adr-007--envoi-via-express-téléchargement-par-url-signée) | Envoi via Express, téléchargement par URL signée | 2026-11-04 | Acceptée |
| [008](#adr-008--authentification-par-jwt-en-en-tête-bearer) | Authentification par JWT en en-tête Bearer | 2026-11-04 | Acceptée |
| [009](#adr-009--état-du-front-avec-des-stores-à-base-de-signals) | État du front avec des stores à base de signals | 2026-11-04 | Acceptée |
| [010](#adr-010--tests-avec-vitest-supertest-et-mongodb-en-mémoire) | Tests avec Vitest, Supertest et MongoDB en mémoire | 2026-11-04 | Acceptée |
| [011](#adr-011--bus-dévénements-interne-pour-le-fil-dactivité) | Bus d'événements interne pour le fil d'activité | 2026-11-04 | Acceptée |
| [012](#adr-012--règle-daccès-centralisée-et-404-pour-les-fiches-invisibles) | Règle d'accès centralisée et 404 pour les fiches invisibles | 2026-11-04 | Acceptée |
| [013](#adr-013--connexion-obligatoire-pour-tout-le-contenu) | Connexion obligatoire pour tout le contenu | 2026-11-04 | Acceptée |
| [014](#adr-014--code-en-anglais-documentation-et-interface-en-français) | Code en anglais, documentation et interface en français | 2026-11-04 | Acceptée |
| [015](#adr-015--journalisation-des-prompts-par-un-hook-claude-code) | Journalisation des prompts par un hook Claude Code | 2026-11-04 | Acceptée |
| [016](#adr-016--workflow-de-branches-main--develop--branches-de-travail) | Workflow de branches main ← develop ← branches de travail | 2026-11-04 | Acceptée |
| [017](#adr-017--versions-de-référence--node-26-angular-22-typescript-60) | Versions de référence : Node 26, Angular 22, TypeScript 6.0 | 2026-11-04 | Acceptée |
| [018](#adr-018--modules-es-et-paquet-partagé-compilé) | Modules ES et paquet partagé compilé | 2026-11-04 | Acceptée |
| [019](#adr-019--mongodb-en-mémoire-pour-les-tests-et-le-développement) | MongoDB en mémoire pour les tests et le développement | 2026-11-04 | Acceptée |

---

## ADR-001 — Sujet : StudyShare

- **Contexte :** le sujet du TP4 laisse le thème libre, à condition de gérer des utilisateurs, des envois de fichiers, des états, des fichiers publics et privés, le partage entre amis (avec arrêt du partage), une recherche et les fichiers récemment ajoutés.
- **Options étudiées :** réseau social musical avec lecteur WebAudio ; galerie photo partagée ; mini-cloud personnel ; suivi de candidatures de stage ; coffre-fort de documents administratifs ; carnet de voyage collaboratif ; revue de maquettes ; **partage de fiches de révision**.
- **Décision :** **StudyShare**, plateforme de partage de fiches de révision entre étudiants.
- **Conséquences :** le besoin est compris de tous et couvre naturellement chaque critère du sujet. Les états d'une fiche (brouillon, publiée, signalée, archivée) et la modération ajoutent une vraie logique métier.

## ADR-002 — TypeScript partout, workspaces npm et types partagés

- **Contexte :** le front et le back échangent les mêmes objets (fiches, utilisateurs, partages).
- **Options :** JavaScript côté serveur ; TypeScript côté serveur avec des types dupliqués ; TypeScript avec un paquet de types partagé.
- **Décision :** TypeScript partout, organisé en **workspaces npm** (`shared`, `server`, `client`), avec le paquet `@studyshare/shared` pour les types et les constantes.
- **Conséquences :** un changement de format côté serveur provoque une erreur de compilation côté Angular. Une seule commande `npm install` et des scripts communs. Configuration un peu plus longue au départ.

## ADR-003 — Découpage par fonctionnalité, front et back

- **Contexte :** le projet grossit par étapes (fiches, amis, groupes, partage…).
- **Options :** découpage par couche technique (`controllers/`, `services/`, `models/`) ; **découpage par fonctionnalité** (`modules/sheets/`, `features/sheets/`).
- **Décision :** découpage par fonctionnalité des deux côtés, avec des noms qui se correspondent. Dans chaque module serveur : routes → controller → service, plus `policy` et `state` pour les règles.
- **Conséquences :** tout ce qui concerne une fonctionnalité est au même endroit ; une étape = un nouveau dossier. Les règles d'accès et de cycle de vie sont des fonctions pures, faciles à tester.

## ADR-004 — MongoDB Atlas et Mongoose

- **Contexte :** le sujet impose une base de données ; le projet doit être déployé gratuitement.
- **Options :** MongoDB ; PostgreSQL (Supabase, Neon).
- **Décision :** **MongoDB Atlas** (offre gratuite M0, environ 512 Mo) avec **Mongoose**.
- **Conséquences :** les fiches avec tags et sous-documents de fichiers se modélisent simplement ; recherche plein texte intégrée. Les relations (amis, partages) se font par références et demandent plusieurs requêtes ou des agrégations. Les données (sans les fichiers) restent largement sous la limite gratuite.

## ADR-005 — Hébergement sur Render

- **Contexte :** déployer gratuitement le front Angular et l'API Express.
- **Options étudiées :**
  - **Vercel / Netlify** : serverless ; limite d'environ 4,5 Mo par requête (fichiers impossibles via Express), pas de tâche après la réponse.
  - **Render** : serveur Express classique ; mise en veille après environ 15 minutes d'inactivité sur l'offre gratuite.
  - **Koyeb** : proche de Render, moins connu. **Railway** : plus d'offre gratuite durable. **Fly.io** : plus d'offre gratuite. **Google Cloud Run** : carte bancaire obligatoire, Docker. **Cloudflare Workers** : Express et Mongoose mal supportés.
- **Décision :** **Render**, avec Angular en *Static Site* (jamais en veille) et l'API en *Web Service*.
- **Conséquences :** Express fonctionne comme en local. Le premier appel après une période d'inactivité prend 30 à 60 secondes : le front affiche « Réveil du serveur… », et il faut ouvrir le site avant une démo. Front et API sur deux adresses : CORS à configurer. Le disque est effacé à chaque redémarrage : stockage des fichiers dans le cloud obligatoire (ADR-006).

## ADR-006 — Stockage des fichiers sur Supabase Storage

- **Contexte :** Render n'a pas de disque permanent gratuit ; les fichiers privés doivent rester inaccessibles sans autorisation.
- **Options étudiées :**
  - **Cloudflare R2** : ~10 Go gratuits, compatible S3, URLs signées, ne se met pas en pause ; carte bancaire demandée.
  - **Supabase Storage** : ~1 Go, ~50 Mo par fichier, bucket privé et URLs signées, sans carte ; projet mis en pause après environ une semaine d'inactivité.
  - **Vercel Blob** : quotas faibles, accès privé moins clair. **Cloudinary** : orienté images. **GridFS (MongoDB)** : consomme les 512 Mo de la base. **Firebase Storage** : facturation exigée.
- **Décision :** **Supabase Storage**, bucket privé, utilisé uniquement par le serveur via `@supabase/supabase-js` et la clé `service_role`.
- **Conséquences :** quotas fixés à 20 Mo par fichier et 50 Mo par utilisateur pour rester sous 1 Go. Penser à relancer le projet Supabase avant une démo (ou appel planifié de `/api/health?deep=1`). L'interface `StorageService` permet de passer à R2 en changeant un seul fichier.

## ADR-007 — Envoi via Express, téléchargement par URL signée

- **Contexte :** comment faire transiter les fichiers entre le navigateur et Supabase.
- **Options :** envoi direct du navigateur vers le stockage par URL signée (3 étapes) ; **envoi via Express** (une requête multipart).
- **Décision :** **envoi via Express** avec Multer en mémoire, vérification du contenu réel, puis transfert vers Supabase. **Téléchargement par redirection** vers une URL signée valable 5 minutes.
- **Conséquences :** une seule requête crée la fiche et ses fichiers ; aucun fichier orphelin (suppression si l'enregistrement échoue) ; validation fiable du type. Les fichiers passent par la mémoire de Render (512 Mo), acceptable avec 20 Mo par fichier et peu d'utilisateurs simultanés. Les téléchargements ne passent pas par Render. Amélioration possible : envoi en flux.

## ADR-008 — Authentification par JWT en en-tête Bearer

- **Contexte :** le front et l'API sont sur deux domaines différents.
- **Options :** **jeton JWT en en-tête `Authorization: Bearer`**, stocké dans `localStorage` ; cookie `httpOnly` (plus sûr contre le XSS, mais cookies inter-domaines, `SameSite=None` et protection CSRF à gérer) ; sessions côté serveur.
- **Décision :** **JWT Bearer**, valable 7 jours.
- **Conséquences :** simple, sans état côté serveur, sans souci de CORS pour les cookies. Le jeton est lisible par du JavaScript : la protection contre le XSS est essentielle (voir [SECURITE.md](SECURITE.md)). Pas de révocation avant expiration.

## ADR-009 — État du front avec des stores à base de signals

- **Contexte :** partager l'état entre les pages (utilisateur connecté, listes de fiches, filtres).
- **Options :** NgRx ; NgRx Signal Store ; **services avec signals faits maison**.
- **Décision :** un `*.store.ts` par fonctionnalité, à base de `signal` et `computed`, et un `*.api.ts` séparé pour les appels HTTP.
- **Conséquences :** peu de code, style recommandé par Angular aujourd'hui, facile à tester. Moins structuré que NgRx pour une très grosse application, ce qui n'est pas le cas ici.

## ADR-010 — Tests avec Vitest, Supertest et MongoDB en mémoire

- **Contexte :** le sujet exige des tests unitaires pour chaque nouvelle fonctionnalité.
- **Options :** Jest ; Jasmine/Karma ; **Vitest**.
- **Décision :** **Vitest** partout (outil de test par défaut des versions récentes d'Angular), **Supertest** pour les routes Express, **mongodb-memory-server** pour une vraie base en mémoire, et `MemoryStorage` à la place de Supabase.
- **Conséquences :** une seule syntaxe et une seule commande `npm test` ; les tests tournent sans internet ni compte cloud, y compris dans GitHub Actions.

## ADR-011 — Bus d'événements interne pour le fil d'activité

- **Contexte :** plusieurs modules produisent des activités (fiches publiées, amis, groupes).
- **Options :** appels directs à `activityService` depuis chaque module ; **bus d'événements interne**.
- **Décision :** un bus typé (`core/events.ts`) ; les modules émettent (`sheet.published`) et `activity.listeners.ts` enregistre. Les écouteurs sont **attendus avant la réponse**.
- **Conséquences :** les modules ne dépendent pas du module d'activité ; des notifications pourront s'ajouter sans toucher au code des fiches. Attendre les écouteurs garantit que rien n'est perdu si le serveur se met en veille.

## ADR-012 — Règle d'accès centralisée et 404 pour les fiches invisibles

- **Contexte :** la visibilité d'une fiche dépend de son état, de sa visibilité, des partages et des groupes. Une erreur ferait fuiter une fiche privée.
- **Décision :** la règle est codée **une seule fois** dans `sheet.policy.ts` : `canViewSheet` pour une fiche, `buildVisibleSheetsFilter` pour toutes les listes. Une fiche invisible renvoie **404** et non 403.
- **Conséquences :** impossible d'oublier un cas dans une nouvelle route de liste ; tests concentrés sur un fichier ; on ne révèle pas l'existence d'une fiche privée.

## ADR-013 — Connexion obligatoire pour tout le contenu

- **Contexte :** « un fichier public peut être trouvé par tout le monde » : faut-il l'ouvrir aux visiteurs non inscrits ?
- **Décision :** « tout le monde » = **tous les utilisateurs inscrits**. Seules l'inscription, la connexion et `/api/health` sont publiques.
- **Conséquences :** une seule logique d'accès, pas de page publique à protéger contre l'aspiration de contenu. Un accès visiteur pourra être ajouté plus tard sans changer le modèle.

## ADR-014 — Code en anglais, documentation et interface en français

- **Décision :** noms dans le code, routes, champs JSON et commits en anglais ; commentaires, documentation, noms des tests et textes de l'interface en français.
- **Conséquences :** le code suit les usages professionnels ; le rendu et l'application restent en français pour l'évaluation et les utilisateurs.

## ADR-015 — Journalisation des prompts par un hook Claude Code

- **Contexte :** chaque prompt envoyé à l'IA pendant le développement doit être tracé, avec son horodatage, dans `docs/RAPPORT_IA.md`.
- **Options :** consigne seule dans `CLAUDE.md` (dépend de l'IA, heure parfois inconnue) ; **hook `UserPromptSubmit`**.
- **Décision :** un hook Node.js (`.claude/hooks/log-prompt.mjs`) enregistre automatiquement chaque prompt avec la date et l'heure de la machine. L'IA complète ensuite le compte rendu de la réponse. Activé par `.claude/hooks/prompt-log.config.json`, **à partir du début du développement**.
- **Conséquences :** journal fiable et exhaustif. Les prompts de la phase de conception ne sont pas journalisés (choix de l'auteur).

## ADR-016 — Workflow de branches main ← develop ← branches de travail

- **Contexte :** le dépôt n'avait que `main`. L'auteur veut que tout le travail se fasse sur des branches séparées, valider lui-même chaque fusion dans `develop`, et être le seul à fusionner dans `main`.
- **Options :** consigne seule dans `CLAUDE.md` ; consigne + règles de permission Claude Code (correspondance par préfixe, fragile) ; **consigne + hook `PreToolUse`** qui analyse les commandes ; protection de branches sur GitHub (complément côté serveur).
- **Décision :** branches `main` ← `develop` ← `<type>/<description>` (types `feature`, `fix`, `enhancement`, `docs`, `chore`, `refactor`, `test`). Le hook `.claude/hooks/guard-git.mjs` refuse toute modification de fichier, tout commit et toute réécriture sur `main` et `develop`, refuse tout push et toute fusion vers `main`, demande la validation de l'utilisateur pour toute fusion ou tout push vers `develop`, et vérifie le nom des nouvelles branches. Fusions avec `--no-ff`.
- **Conséquences :** impossible pour l'IA de travailler par erreur sur une branche protégée ; chaque fusion dans `develop` passe par une confirmation explicite. Le hook ne s'applique qu'à Claude Code. Pour protéger aussi le dépôt GitHub, il est conseillé d'activer la protection de branche sur `main` et `develop` (fusion par pull request uniquement).

## ADR-017 — Versions de référence : Node 26, Angular 22, TypeScript 6.0

- **Contexte :** au démarrage de l'étape 0, la dernière version d'Angular (22.2) exige Node.js 22.22.3, 24.15 ou 26 ; la machine de développement avait Node 22.19. Angular 22 et `typescript-eslint` acceptent TypeScript 6.0, pas encore TypeScript 7.
- **Options :** rester sur Angular 21 (compatible avec Node 22.19) ; **mettre Node à jour et utiliser Angular 22**.
- **Décision :** **Node.js 26 LTS** (installé avec winget), **Angular 22.2**, Angular Material 22, **TypeScript 6.0**, Express 5, Mongoose 9, Zod 4, Vitest 5, ESLint 10. Le champ `engines` du `package.json` racine impose `^22.22.3 || ^24.15.0 || >=26.0.0`.
- **Conséquences :** dernières versions, pas de migration à prévoir pendant le projet. La CI et Render doivent utiliser Node 26 (à fixer à l'étape 8).

## ADR-018 — Modules ES et paquet partagé compilé

- **Contexte :** `shared` doit être utilisable par le serveur (Node.js) et par Angular.
- **Options :** importer directement les sources TypeScript de `shared` (alias de chemins, fragile à l'exécution) ; **compiler `shared` en JavaScript ES dans `shared/dist`**.
- **Décision :** `shared` et `server` sont des paquets **ESM** (`"type": "module"`, `module: NodeNext`) ; `shared` est compilé par `npm run build:shared`, lancé automatiquement par `dev`, `test` et `build`.
- **Conséquences :** le même code tourne en développement (`tsx`), en test (Vitest) et en production (`node dist/server.js`). Les imports relatifs du serveur portent l'extension `.js` (voir [CONVENTIONS.md](CONVENTIONS.md)). Après une modification de `shared` pendant `npm run dev`, relancer `npm run build:shared`.

## ADR-019 — MongoDB en mémoire pour les tests et le développement

- **Contexte :** les tests ne doivent dépendre d'aucun service externe, et le projet doit pouvoir démarrer sans compte MongoDB Atlas.
- **Décision :** **`mongodb-memory-server`**. Pour les tests : une seule instance pour toute la suite (`tests/global-setup.ts`), une base distincte par fichier, vidée entre deux tests (`tests/setup.ts`). En développement : si `MONGODB_URI` est absente, `server.ts` démarre une base en mémoire. En production, `MONGODB_URI` est obligatoire (vérifié par `config/env.ts`).
- **Conséquences :** `npm install` puis `npm run dev` suffisent pour lancer le projet. Le premier lancement télécharge le binaire MongoDB (environ 100 Mo, mis en cache). En développement, les données sont perdues à chaque arrêt du serveur : utiliser une vraie base pour garder des données.
