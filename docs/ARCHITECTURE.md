# Architecture de StudyShare

> Ce document décrit l'architecture **cible** du projet, de la racine jusqu'aux fichiers.
> Légende de l'arborescence : ✅ existe · 🔲 prévu (créé à l'étape indiquée dans [ROADMAP.md](ROADMAP.md)).
> Les règles de nommage sont dans [CONVENTIONS.md](CONVENTIONS.md), les raisons des choix dans [DECISIONS.md](DECISIONS.md).

## 1. Vue d'ensemble

```
┌──────────────────────────┐   HTTPS (JSON + jeton JWT)   ┌──────────────────────────┐
│ Render Static Site       │ ───────────────────────────▶ │ Render Web Service       │
│ Application Angular      │            /api/*            │ API Express (Node.js)    │
│ (fichiers compilés)      │ ◀─────────────────────────── │                          │
│ jamais en veille         │                              │ peut se mettre en veille │
└────────────┬─────────────┘                              └──────┬────────────┬──────┘
             │ téléchargement (URL signée, 5 min)                │            │
             ▼                                                   ▼            ▼
┌──────────────────────────┐                     ┌──────────────────┐  ┌─────────────────────┐
│ Supabase Storage         │ ◀───── envoi ────── │ (le serveur parle│  │ MongoDB Atlas       │
│ bucket privé             │    (clé serveur)    │  seul à Supabase)│  │ données (M0 gratuit)│
└──────────────────────────┘                     └──────────────────┘  └─────────────────────┘
```

**Principes :**

- **Découpage par fonctionnalité, des deux côtés** : le dossier `sheets/` du serveur correspond au dossier `sheets/` d'Angular.
- **TypeScript partout**, avec des types communs dans `shared/`.
- **Le serveur est le seul à accéder à Supabase.** Le navigateur ne reçoit que des URLs de téléchargement signées et temporaires.
- **La règle d'accès est centralisée** dans `sheet.policy.ts`.
- **Le stockage est caché derrière une interface** (`StorageService`) : Supabase en production, mémoire dans les tests.

## 2. Arborescence complète

```
AngularM1Miage_2026_2027_TP456_Laurent/        racine du dépôt (projet StudyShare)
│
├── .claude/                                    ✅ configuration de Claude Code pour ce projet
│   ├── launch.json                             ✅ aperçu de l'application dans Claude Code (http://localhost:4200)
│   ├── settings.json                           ✅ déclare les hooks (journalisation des prompts, garde git)
│   └── hooks/
│       ├── guard-git.mjs                       ✅ fait respecter le workflow de branches (voir CONVENTIONS.md)
│       ├── log-prompt.mjs                      ✅ écrit chaque prompt horodaté dans docs/RAPPORT_IA.md
│       └── prompt-log.config.json              ✅ { "enabled": false } — activé au début du développement
│
├── .github/                                    ✅
│   └── workflows/
│       └── ci.yml                              ✅ lint + tests + build à chaque push (appel planifié de /api/health?deep=1 : 🔲 étape 8)
│
├── docs/                                       ✅ documentation du projet
│   ├── PRESENTATION.md                         ✅ ce qu'est StudyShare
│   ├── FONCTIONNALITES.md                      ✅ fonctionnement de chaque page
│   ├── ARCHITECTURE.md                         ✅ ce document
│   ├── MODELE_DONNEES.md                       ✅ collections, cycle de vie, règle d'accès
│   ├── APIs.md                                 ✅ routes de l'API
│   ├── CONVENTIONS.md                          ✅ règles de code
│   ├── SECURITE.md                             ✅ mesures de sécurité
│   ├── DECISIONS.md                            ✅ journal des choix techniques
│   ├── TESTS.md                                ✅ stratégie et résultats des tests
│   ├── DEPLOIEMENT.md                          ✅ guide de déploiement
│   ├── ROADMAP.md                              ✅ étapes et avancement
│   └── RAPPORT_IA.md                           ✅ journal des prompts
│
├── shared/                                     ✅ types et constantes communs (paquet @studyshare/shared)
│   ├── package.json                            ✅ paquet ESM ; « main » pointe vers dist/ (compilé avant le serveur et le client)
│   ├── tsconfig.json                           ✅
│   ├── dist/                                   (généré par npm run build:shared, ignoré par git)
│   └── src/
│       ├── index.ts                            ✅ réexporte tout le paquet
│       ├── constants/
│       │   ├── files.constants.ts              ✅ types MIME acceptés, tailles maximales, nombre de fichiers, quota
│       │   ├── sheet.constants.ts              ✅ SHEET_STATUSES, SUBJECTS, LEVELS, limites de longueur, REPORT_THRESHOLD
│       │   └── pagination.constants.ts         ✅ DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
│       └── types/
│           ├── api.types.ts                    ✅ ApiError, ApiErrorDetail, Paginated<T>
│           ├── health.types.ts                 ✅ HealthResponse, DeepHealthResponse
│           ├── user.types.ts                   🔲 étape 1 — User, PublicUser, UserRole, AuthResponse
│           ├── sheet.types.ts                  🔲 étape 2 — Sheet, SheetFile, SheetSummary, SheetSearchQuery
│           ├── friendship.types.ts             🔲 étape 4 — Friendship, FriendshipStatus
│           ├── group.types.ts                  🔲 étape 5 — Group
│           ├── share.types.ts                  🔲 étape 5 — Share, ShareTargetType
│           ├── report.types.ts                 🔲 étape 7 — Report, ReportReason, ReportStatus
│           └── activity.types.ts               🔲 étape 6 — Activity, ActivityType
│
├── server/                                     ✅ API Express (paquet @studyshare/server)
│   ├── package.json                            ✅ scripts dev (tsx watch), build (tsc), start, test, test:coverage
│   ├── tsconfig.json                           ✅ hérite de tsconfig.base.json (ESM, NodeNext)
│   ├── tsconfig.build.json                     ✅ compilation de production, sans les tests
│   ├── vitest.config.ts                        ✅ variables de test, base en mémoire, couverture
│   ├── .env.example                            ✅ modèle des variables d'environnement (sans secret)
│   ├── scripts/
│   │   └── make-moderator.ts                   🔲 étape 7 — donne le rôle modérateur à un utilisateur
│   └── src/
│       ├── app.ts                              ✅ crée l'application Express (helmet, CORS, JSON, routes) sans la démarrer
│       ├── app.spec.ts                         ✅
│       ├── server.ts                           ✅ connexion MongoDB (en mémoire si MONGODB_URI absente en dev) puis démarrage
│       ├── config/
│       │   ├── env.ts                          ✅ charge server/.env, valide avec Zod ; seul fichier qui lit process.env
│       │   └── env.spec.ts                     ✅
│       ├── core/
│       │   ├── db.ts                           ✅ connexion, déconnexion, test de santé Mongoose ; sanitizeFilter activé
│       │   ├── errors.ts                       ✅ classe AppError(status, code, message, details)
│       │   ├── events.ts                       🔲 étape 6 — bus d'événements interne typé (sheet.published, …)
│       │   ├── logger.ts                       ✅ journalisation (muette pendant les tests, sans données sensibles)
│       │   └── middlewares/
│       │       ├── auth.middleware.ts          🔲 étape 1 — requireAuth, requireRole('moderator')
│       │       ├── validate.middleware.ts      ✅ validate({ params, query, body }) avec Zod (messages en français) ; validated()
│       │       ├── validate.middleware.spec.ts ✅
│       │       ├── upload.middleware.ts        🔲 étape 2 — Multer en mémoire + vérification du contenu réel (file-type)
│       │       ├── rate-limit.middleware.ts    🔲 étape 1 — limite le nombre de tentatives de connexion
│       │       ├── not-found.middleware.ts     ✅ 404 ROUTE_NOT_FOUND
│       │       ├── error-handler.middleware.ts ✅ transforme toute erreur en JSON { error: { code, message, details } }
│       │       └── error-handler.middleware.spec.ts ✅ (couvre aussi not-found)
│       ├── storage/
│       │   ├── storage.ts                      ✅ interface StorageService (upload, getDownloadUrl, delete, isHealthy)
│       │   ├── supabase.storage.ts             🔲 étape 2 — implémentation Supabase (@supabase/supabase-js)
│       │   ├── memory.storage.ts               ✅ implémentation en mémoire (tests, développement)
│       │   ├── memory.storage.spec.ts          ✅
│       │   └── index.ts                        ✅ getStorage() : choisit l'implémentation selon STORAGE_DRIVER
│       ├── modules/
│       │   ├── health/                         ✅ étape 0
│       │   │   ├── health.routes.ts
│       │   │   ├── health.controller.ts
│       │   │   ├── health.service.ts           état simple et vérification de MongoDB et du stockage
│       │   │   ├── health.schemas.ts           paramètre deep
│       │   │   └── health.routes.spec.ts
│       │   ├── auth/                           🔲 étape 1
│       │   │   ├── auth.routes.ts
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts             inscription, connexion, création et vérification du JWT
│       │   │   ├── auth.schemas.ts
│       │   │   ├── auth.service.spec.ts
│       │   │   └── auth.routes.spec.ts
│       │   ├── users/                          🔲 étape 1
│       │   │   ├── user.model.ts
│       │   │   ├── user.routes.ts
│       │   │   ├── user.controller.ts
│       │   │   ├── user.service.ts             profil, recherche d'utilisateurs, quota
│       │   │   ├── user.schemas.ts
│       │   │   ├── user.mapper.ts              document Mongoose → User / PublicUser (sans passwordHash)
│       │   │   ├── user.service.spec.ts
│       │   │   └── user.routes.spec.ts
│       │   ├── sheets/                         🔲 étapes 2 et 3
│       │   │   ├── sheet.model.ts              schéma, sous-document SheetFile, index
│       │   │   ├── sheet.routes.ts
│       │   │   ├── sheet.controller.ts
│       │   │   ├── sheet.service.ts            création, modification, suppression, téléchargement
│       │   │   ├── sheet-search.service.ts     fiches récentes, recherche, « mes fiches », « partagées avec moi »
│       │   │   ├── sheet.policy.ts             canViewSheet, canEditSheet, buildVisibleSheetsFilter
│       │   │   ├── sheet.state.ts              table des transitions, assertTransition
│       │   │   ├── sheet.schemas.ts
│       │   │   ├── sheet.mapper.ts
│       │   │   ├── sheet.policy.spec.ts
│       │   │   ├── sheet.state.spec.ts
│       │   │   ├── sheet.service.spec.ts
│       │   │   ├── sheet-search.service.spec.ts
│       │   │   └── sheet.routes.spec.ts
│       │   ├── friends/                        🔲 étape 4
│       │   │   ├── friendship.model.ts
│       │   │   ├── friend.routes.ts
│       │   │   ├── friend.controller.ts
│       │   │   ├── friend.service.ts
│       │   │   ├── friend.schemas.ts
│       │   │   ├── friend.service.spec.ts
│       │   │   └── friend.routes.spec.ts
│       │   ├── groups/                         🔲 étape 5
│       │   │   ├── group.model.ts
│       │   │   ├── group.routes.ts
│       │   │   ├── group.controller.ts
│       │   │   ├── group.service.ts
│       │   │   ├── group.schemas.ts
│       │   │   ├── group.service.spec.ts
│       │   │   └── group.routes.spec.ts
│       │   ├── shares/                         🔲 étape 5
│       │   │   ├── share.model.ts
│       │   │   ├── share.routes.ts             routes imbriquées /api/sheets/:sheetId/shares
│       │   │   ├── share.controller.ts
│       │   │   ├── share.service.ts            partager, arrêter un partage, fiches partagées avec un utilisateur
│       │   │   ├── share.schemas.ts
│       │   │   ├── share.service.spec.ts
│       │   │   └── share.routes.spec.ts
│       │   ├── activity/                       🔲 étape 6
│       │   │   ├── activity.model.ts
│       │   │   ├── activity.listeners.ts       écoute le bus d'événements et enregistre les activités
│       │   │   ├── activity.routes.ts
│       │   │   ├── activity.controller.ts
│       │   │   ├── activity.service.ts
│       │   │   ├── activity.service.spec.ts
│       │   │   └── activity.routes.spec.ts
│       │   └── moderation/                     🔲 étape 7
│       │       ├── report.model.ts
│       │       ├── moderation.routes.ts
│       │       ├── moderation.controller.ts
│       │       ├── moderation.service.ts       signaler, seuil, décisions des modérateurs
│       │       ├── moderation.schemas.ts
│       │       ├── moderation.service.spec.ts
│       │       └── moderation.routes.spec.ts
│       └── tests/
│           ├── global-setup.ts                 ✅ démarre une seule base MongoDB en mémoire pour toute la suite
│           ├── setup.ts                        ✅ une base par fichier de test, vidée entre deux tests
│           ├── factories.ts                    🔲 étape 1 — crée des utilisateurs, fiches, amitiés… de test
│           └── fixtures/                       🔲 étape 2 — petits fichiers de test (PDF, PNG, faux PDF)
│
├── client/                                     ✅ application Angular 22 (paquet @studyshare/client)
│   ├── package.json                            ✅ scripts start, build, test, test:coverage
│   ├── angular.json                            ✅ proxy en dev, remplacement d'environnement, schémas OnPush
│   ├── tsconfig.json                           ✅ configuration TypeScript générée par Angular (stricte)
│   ├── tsconfig.app.json                       ✅
│   ├── tsconfig.spec.json                      ✅
│   ├── proxy.conf.json                         ✅ en développement : /api → http://localhost:3000
│   ├── public/
│   │   └── favicon.ico                         ✅
│   └── src/
│       ├── index.html                          ✅ langue fr, polices Roboto et Material Icons
│       ├── main.ts                             ✅
│       ├── styles.scss                         ✅ thème Angular Material 3, styles globaux
│       ├── environments/
│       │   ├── environment.ts                  ✅ production : apiUrl = adresse de l'API sur Render (à confirmer étape 8)
│       │   └── environment.development.ts      ✅ développement : apiUrl = /api (proxy)
│       └── app/
│           ├── app.component.ts                ✅ composant racine (affiche app-shell)
│           ├── app.component.spec.ts           ✅
│           ├── app.config.ts                   ✅ providers : routeur, HttpClient (interceptors : 🔲 étape 1)
│           ├── app.routes.ts                   ✅ routes principales, chargement à la demande des fonctionnalités
│           ├── core/                           services uniques pour toute l'application
│           │   ├── health/                     ✅
│           │   │   ├── health.api.ts           appel GET /api/health
│           │   │   └── health.api.spec.ts
│           │   ├── auth/                       🔲 étape 1
│           │   │   ├── auth.api.ts             appels /api/auth/*
│           │   │   ├── auth.store.ts           utilisateur connecté, jeton, isAuthenticated (signals)
│           │   │   ├── auth.interceptor.ts     ajoute « Authorization: Bearer » aux requêtes /api uniquement
│           │   │   ├── auth.guard.ts           redirige vers /login si non connecté
│           │   │   ├── guest.guard.ts          redirige vers / si déjà connecté (pages login, register)
│           │   │   ├── role.guard.ts           réserve une route à un rôle (modérateur)
│           │   │   ├── token.storage.ts        lecture et écriture du jeton dans localStorage
│           │   │   └── *.spec.ts               un test par fichier ci-dessus
│           │   ├── http/                       🔲 étape 1
│           │   │   ├── error.interceptor.ts    affiche les erreurs ; 401 → déconnexion
│           │   │   └── error.interceptor.spec.ts
│           │   ├── notifications/              🔲 étape 1
│           │   │   └── notification.service.ts messages temporaires (MatSnackBar)
│           │   └── layout/
│           │       ├── shell/                  ✅ barre du haut + menu latéral (replié sur téléphone) + <router-outlet>
│           │       │   ├── shell.component.ts | .html | .scss | .spec.ts
│           │       └── server-wakeup/          🔲 étape 1 — bandeau « Réveil du serveur… »
│           │           ├── server-wakeup.component.ts | .html | .scss | .spec.ts
│           ├── shared/                         🔲 étape 2 — composants réutilisables, sans logique métier
│           │   ├── ui/
│           │   │   ├── sheet-card/             carte d'une fiche
│           │   │   ├── status-badge/           pastille d'état
│           │   │   ├── visibility-icon/        🔒 / 🌐
│           │   │   ├── file-dropzone/          glisser-déposer, liste et progression des fichiers
│           │   │   ├── user-avatar/
│           │   │   ├── confirm-dialog/
│           │   │   └── empty-state/            message quand une liste est vide
│           │   │       (chaque dossier : <nom>.component.ts | .html | .scss | .spec.ts)
│           │   ├── pipes/
│           │   │   ├── file-size.pipe.ts       1048576 → « 1 Mo »
│           │   │   ├── relative-time.pipe.ts   date → « il y a 3 heures »
│           │   │   ├── subject-label.pipe.ts   computer-science → « Informatique »
│           │   │   └── *.spec.ts
│           │   └── utils/
│           │       └── form-errors.ts          messages d'erreur des formulaires en français
│           └── features/                       une fonctionnalité = un dossier, chargé à la demande
│               ├── auth/                       🔲 étape 1
│               │   ├── auth.routes.ts
│               │   └── pages/
│               │       ├── login/              login.page.ts | .html | .scss | .spec.ts
│               │       └── register/           register.page.ts | .html | .scss | .spec.ts
│               ├── home/                       ✅ étape 0 (présentation + état du serveur) ; contenu aux étapes 3 et 6
│               │   ├── home.routes.ts
│               │   └── pages/home/             home.page.ts | .html | .scss | .spec.ts
│               ├── sheets/                     🔲 étapes 2 et 5
│               │   ├── sheets.routes.ts
│               │   ├── data/
│               │   │   ├── sheets.api.ts       appels HTTP /api/sheets/*
│               │   │   ├── sheets.store.ts     état des listes et de la fiche ouverte (signals)
│               │   │   ├── shares.api.ts       appels HTTP /api/sheets/:id/shares
│               │   │   └── *.spec.ts
│               │   ├── pages/
│               │   │   ├── my-sheets/          my-sheets.page.*
│               │   │   ├── sheet-detail/       sheet-detail.page.*
│               │   │   └── sheet-form/         sheet-form.page.* (création et modification)
│               │   └── components/
│               │       ├── share-dialog/       fenêtre de partage
│               │       ├── sheet-files-list/   liste des fichiers, téléchargement
│               │       ├── status-actions/     boutons publier / archiver / …
│               │       └── report-dialog/      🔲 étape 7 — fenêtre de signalement
│               ├── search/                     🔲 étape 3
│               │   ├── search.routes.ts
│               │   ├── data/search.store.ts    filtres synchronisés avec l'adresse de la page
│               │   ├── pages/search/           search.page.*
│               │   └── components/search-filters/
│               ├── friends/                    🔲 étape 4
│               │   ├── friends.routes.ts
│               │   ├── data/                   friends.api.ts, friends.store.ts
│               │   ├── pages/friends/          friends.page.*
│               │   └── components/
│               │       ├── friend-request-card/
│               │       └── user-search/
│               ├── groups/                     🔲 étape 5
│               │   ├── groups.routes.ts
│               │   ├── data/                   groups.api.ts, groups.store.ts
│               │   ├── pages/
│               │   │   ├── groups-list/        groups-list.page.*
│               │   │   └── group-detail/       group-detail.page.*
│               │   └── components/
│               │       ├── group-form-dialog/
│               │       └── member-picker/
│               ├── activity/                   🔲 étape 6
│               │   ├── data/activity.api.ts
│               │   └── components/activity-feed/   utilisé dans la page d'accueil
│               ├── moderation/                 🔲 étape 7
│               │   ├── moderation.routes.ts
│               │   ├── data/moderation.api.ts
│               │   └── pages/moderation-queue/ moderation-queue.page.*
│               └── profile/                    🔲 étape 1 (mon profil) et 4 (profil des autres)
│                   ├── profile.routes.ts
│                   ├── data/users.api.ts
│                   └── pages/
│                       ├── my-profile/         my-profile.page.*
│                       └── user-profile/       user-profile.page.*
│
├── .editorconfig                               ✅ indentation, fins de ligne
├── .gitattributes                              ✅ fins de ligne LF dans le dépôt, quel que soit le système
├── .gitignore                                  ✅ node_modules, dist, .angular, coverage, .env
├── .prettierrc                                 ✅ règles de mise en forme
├── .prettierignore                             ✅ fichiers non formatés (dont la documentation Markdown)
├── eslint.config.mjs                           ✅ ESLint commun : TypeScript, Angular, ordre des imports, Prettier
├── tsconfig.base.json                          ✅ options TypeScript communes à shared et server (strict, NodeNext)
├── package.json                                ✅ workspaces shared, server, client ; scripts globaux
├── package-lock.json                           ✅ versions exactes des dépendances
├── render.yaml                                 🔲 étape 8 — déclaration des services Render
├── CLAUDE.md                                   ✅ règles de l'assistant IA
├── README.md                                   ✅ présentation et installation
└── REPORT.md                                   ✅ rapport du projet (exigé par le sujet)
```

## 3. Back-end : organisation d'un module

Chaque module de `server/src/modules/` suit le même découpage :

| Fichier | Rôle | A le droit de… | N'a pas le droit de… |
|---|---|---|---|
| `*.routes.ts` | Déclare les routes et leurs middlewares | Enchaîner `requireAuth`, `validate`, `upload`, le controller | Contenir de la logique |
| `*.controller.ts` | Lit la requête, appelle le service, envoie la réponse | Utiliser `req` et `res` | Accéder à la base, contenir des règles métier |
| `*.service.ts` | Logique métier | Utiliser les modèles, `policy`, `state`, `storage`, `events` ; lever des `AppError` | Utiliser `req` ou `res` |
| `*.policy.ts` | Règles d'accès (fonctions pures) | — | Faire des appels à la base (les données lui sont fournies) |
| `*.state.ts` | Transitions d'état (fonctions pures) | — | Faire des appels à la base |
| `*.schemas.ts` | Validation des entrées (Zod) | — | — |
| `*.model.ts` | Schéma Mongoose et index | — | Contenir des règles métier |
| `*.mapper.ts` | Transforme un document en objet renvoyé par l'API | — | Renvoyer un champ sensible |

### Parcours d'une requête

```
Requête HTTP
  → app.ts : helmet, cors, express.json, rate-limit
  → *.routes.ts : requireAuth → validate(schema) → [upload]
  → *.controller.ts
  → *.service.ts ──→ *.policy.ts / *.state.ts (règles)
                 ──→ *.model.ts (MongoDB)
                 ──→ storage (Supabase)
                 ──→ events.emit('sheet.published', …) ──→ activity.listeners.ts
  ← réponse JSON (via *.mapper.ts)

Toute erreur levée ──→ error-handler.middleware.ts ──→ { "error": { "code", "message" } }
```

Le bus d'événements est **synchrone du point de vue de la requête** : les écouteurs sont attendus (`await`) avant d'envoyer la réponse, pour que l'activité soit enregistrée même si le serveur se met en veille juste après.

### Envoi d'un fichier

1. `upload.middleware.ts` reçoit le formulaire multipart, garde les fichiers **en mémoire** (20 Mo max chacun, 5 max).
2. Il vérifie le **contenu réel** de chaque fichier (bibliothèque `file-type`) et refuse ce qui n'est pas PDF, PNG ou JPG.
3. `sheet.service.ts` vérifie le **quota**, génère un chemin `users/{userId}/{uuid}.{ext}` et envoie chaque fichier à `storage.upload`.
4. Il enregistre la fiche dans MongoDB et incrémente `storageUsed`.
5. **Si l'enregistrement échoue**, les fichiers déjà envoyés sont supprimés de Supabase (aucun fichier orphelin).

### Téléchargement d'un fichier

1. `GET /api/sheets/:sheetId/files/:fileId/download` → `sheet.service.ts` vérifie `canViewSheet`.
2. Il incrémente `downloadsCount` et demande à `storage.getDownloadUrl` une URL signée valable **5 minutes**, avec le nom d'origine.
3. L'API répond `302` vers cette URL. Le fichier ne transite pas par Render.

## 4. Front-end : organisation

| Dossier | Contenu | Règle |
|---|---|---|
| `core/` | Services uniques : authentification, gestion des erreurs, structure de page | Importé une seule fois, par `app.config.ts` et `app.component.ts` |
| `shared/` | Composants, pipes et utilitaires réutilisables | Aucun appel HTTP, aucune logique métier |
| `features/<nom>/` | Une fonctionnalité complète, chargée à la demande | Ne dépend pas d'une autre fonctionnalité (sauf `activity` utilisé par `home`) |
| `features/<nom>/data/` | `*.api.ts` (appels HTTP) et `*.store.ts` (état avec signals) | Les pages passent par le store, pas directement par l'API |
| `features/<nom>/pages/` | Composants associés à une route | Récupèrent les données et réagissent aux actions |
| `features/<nom>/components/` | Composants propres à la fonctionnalité | Reçoivent des données (`input()`) et émettent des événements (`output()`) |

**Choix Angular :** composants *standalone*, *signals*, `inject()`, contrôle de flux `@if` / `@for`, détection de changement `OnPush`, formulaires réactifs typés, Angular Material.

**Communication avec l'API :**
- en développement, `proxy.conf.json` redirige `/api` vers `localhost:3000` ;
- en production, `environment.apiUrl` pointe vers l'API Render (CORS autorisé seulement pour l'adresse du front) ;
- `auth.interceptor.ts` ajoute le jeton **seulement** aux requêtes vers `apiUrl` ;
- un envoi de fichier utilise `reportProgress` pour afficher la barre de progression.

## 5. Environnements

| | Tests | Développement | Production |
|---|---|---|---|
| Base de données | MongoDB en mémoire (`mongodb-memory-server`), une base par fichier de test | MongoDB Atlas (base `studyshare-dev`), MongoDB local, ou **en mémoire si `MONGODB_URI` est absente** (données perdues à l'arrêt) | MongoDB Atlas (base `studyshare`) |
| Stockage | `memory` | `memory` ou bucket Supabase de développement | Bucket Supabase privé `studyshare-files` |
| Front → API | — | Proxy `/api` → `localhost:3000` | Adresse Render + CORS |
| Variables | Fixées par `tests/setup.ts` | `server/.env` | Tableau de bord Render |

## 6. Déploiement

| Élément | Service Render | Détail |
|---|---|---|
| Angular | **Static Site** | Commande : `npm ci && npm run build -w client` ; dossier publié : `client/dist/client/browser` ; réécriture `/*` → `/index.html` |
| Express | **Web Service** (offre gratuite) | Commande : `npm ci && npm run build -w server` ; démarrage : `npm run start -w server` ; vérification de santé : `/api/health` |

Les services sont décrits dans `render.yaml`. Guide complet : [DEPLOIEMENT.md](DEPLOIEMENT.md).
