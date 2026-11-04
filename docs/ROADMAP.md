# Feuille de route

> Découpage du travail en étapes, conformément au sujet (« divisez l'implémentation en plusieurs tâches, puis commencez par réaliser la première »).
> État : 🔲 à faire · 🔄 en cours · ✅ terminé
>
> **Chaque étape** se termine par : tests unitaires écrits et au vert, documentation à jour, résultats dans [TESTS.md](TESTS.md), section ajoutée à [REPORT.md](../REPORT.md).

## Vue d'ensemble

| # | Étape | Contenu principal | État |
|---|---|---|---|
| — | **Conception** | Sujet, fonctionnalités, architecture, choix techniques, documentation | ✅ |
| 0 | **Mise en place** | Workspaces, serveur, Angular, outillage, `/api/health` | 🔲 |
| 1 | **Authentification** | Inscription, connexion, JWT, profil, guards | 🔲 |
| 2 | **Fiches et fichiers** | Créer, modifier, supprimer, envoyer, télécharger, états | 🔲 |
| 3 | **Découverte** | Fiches récentes, recherche, filtres, pagination, accueil | 🔲 |
| 4 | **Amis** | Recherche d'utilisateurs, invitations, liste d'amis, profils | 🔲 |
| 5 | **Groupes et partage** | Groupes, fenêtre de partage, arrêt du partage, « Partagées avec moi » | 🔲 |
| 6 | **Fil d'activité** | Bus d'événements, activités, fil sur l'accueil | 🔲 |
| 7 | **Modération** | Signalements, seuil, file de modération | 🔲 |
| 8 | **Déploiement et finitions** | Render + Atlas + Supabase, bonus, rapport final | 🔲 |

---

## ✅ Conception (2026-11-04)

- [x] Choix du sujet (ADR-001)
- [x] Fonctionnalités et écrans ([FONCTIONNALITES.md](FONCTIONNALITES.md))
- [x] Architecture ([ARCHITECTURE.md](ARCHITECTURE.md)) et modèle de données ([MODELE_DONNEES.md](MODELE_DONNEES.md))
- [x] Choix d'hébergement et de stockage (ADR-005, ADR-006)
- [x] Routes de l'API prévues ([APIs.md](APIs.md))
- [x] Conventions, sécurité, stratégie de tests
- [x] `CLAUDE.md` et hook de journalisation des prompts
- [x] Workflow de branches `main` ← `develop` ← branches de travail, avec hook de garde (ADR-016)

## 🔲 Étape 0 — Mise en place

- [ ] Activer la journalisation des prompts (`.claude/hooks/prompt-log.config.json`)
- [ ] `package.json` racine avec workspaces `shared`, `server`, `client` et scripts `dev`, `test`, `lint`, `build`
- [ ] `tsconfig.base.json`, ESLint, Prettier, `.editorconfig`, `.gitignore`
- [ ] Paquet `shared` : premiers types et constantes
- [ ] Serveur : `app.ts`, `server.ts`, `config/env.ts`, `core/` (erreurs, middlewares d'erreur et 404), `storage/` (interface + mémoire), module `health`
- [ ] `server/.env.example`
- [ ] Client : application Angular avec Angular Material, proxy `/api`, structure `core/ shared/ features/`, shell (barre + menu)
- [ ] Vitest configuré dans `server` et `client` ; `tests/setup.ts` avec MongoDB en mémoire
- [ ] Premiers tests : `GET /api/health`, middleware d'erreurs, `env.ts`, composant shell
- [ ] GitHub Actions : lint + tests à chaque push

**Terminé quand :** `npm run dev` affiche l'application Angular, qui appelle `/api/health` ; `npm test` et `npm run lint` passent.

## 🔲 Étape 1 — Authentification

- [ ] Modèle `User`, hash bcrypt, mapper
- [ ] `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PATCH /api/users/me`
- [ ] `requireAuth`, `requireRole`, limitation des tentatives
- [ ] Angular : `AuthStore`, `authInterceptor`, `authGuard`, `guestGuard`, `errorInterceptor`
- [ ] Pages Connexion, Inscription, Mon profil ; bandeau « Réveil du serveur… »
- [ ] Tests : inscription (succès, doublons, validations), connexion (succès, échec), routes protégées, guards, interceptors

## 🔲 Étape 2 — Fiches et fichiers

- [ ] Modèle `Sheet` (avec `SheetFile`), `sheet.state.ts`, `sheet.policy.ts` (version propriétaire et public)
- [ ] `upload.middleware.ts` : Multer, vérification du contenu réel, limites
- [ ] `SupabaseStorage` (et `MemoryStorage` pour les tests), quota utilisateur
- [ ] Routes : créer, lire, modifier, supprimer, changer l'état, ajouter ou retirer un fichier, télécharger, `mine`, `quota`
- [ ] Angular : `SheetsApi`, `SheetsStore`, pages Mes fiches, Créer/Modifier, Détail ; composants carte, pastille, zone de dépôt avec progression
- [ ] Tests : toutes les transitions (autorisées et refusées), faux PDF refusé, quota, suppression des orphelins, droits du propriétaire, téléchargement (302)

## 🔲 Étape 3 — Découverte

- [ ] `buildVisibleSheetsFilter` ; index texte
- [ ] `GET /api/sheets/recent`, `GET /api/sheets/search` (mots-clés, filtres, tri, pagination)
- [ ] Angular : page Recherche (filtres dans l'adresse), page d'accueil (section « Récemment ajoutées »)
- [ ] Tests : une fiche privée, un brouillon ou une fiche signalée n'apparaissent jamais ; filtres ; tri ; pagination

## 🔲 Étape 4 — Amis

- [ ] Modèle `Friendship` (`pairKey` unique)
- [ ] Recherche d'utilisateurs, invitations (envoyer, accepter, refuser, annuler), liste, retrait d'un ami
- [ ] Profil public d'un utilisateur et ses fiches visibles
- [ ] Angular : page Amis (3 onglets), profil d'un utilisateur
- [ ] Tests : invitation à soi-même, doublon, acceptation automatique croisée, retrait

## 🔲 Étape 5 — Groupes et partage

- [ ] Modèles `Group` et `Share` ; règle d'accès complète (partages directs et par groupe)
- [ ] Routes des groupes et des partages ; `GET /api/sheets/shared-with-me`
- [ ] Effets en cascade : retrait d'un ami, départ d'un groupe, suppression d'un groupe
- [ ] Angular : pages Groupes et Détail d'un groupe, fenêtre de partage, section « Partagées avec moi »
- [ ] Tests : **chaque cas de la règle d'accès**, arrêt du partage effectif, partage refusé à un non-ami, cascades

## 🔲 Étape 6 — Fil d'activité

- [ ] Bus d'événements `core/events.ts`, modèle `Activity` (TTL 90 jours), `activity.listeners.ts`
- [ ] `GET /api/activity/feed`
- [ ] Angular : composant `activity-feed` sur l'accueil
- [ ] Tests : seules les activités des amis ; une fiche privée non partagée n'apparaît pas dans le fil

## 🔲 Étape 7 — Modération

- [ ] Modèle `Report`, seuil de 3 signalements, passage automatique à `reported`
- [ ] Routes de signalement et de modération ; script `make-moderator`
- [ ] Angular : fenêtre de signalement, page File de modération (`roleGuard`)
- [ ] Tests : signalement de sa propre fiche refusé, doublon refusé, seuil, décisions, accès réservé aux modérateurs

## 🔲 Étape 8 — Déploiement et finitions

- [ ] Créer MongoDB Atlas, le bucket Supabase et les services Render ([DEPLOIEMENT.md](DEPLOIEMENT.md))
- [ ] `render.yaml`, CORS, variables d'environnement
- [ ] Appel planifié de `/api/health?deep=1` (GitHub Actions)
- [ ] Bonus selon le temps : favoris, aperçu des PDF, notifications, commentaires
- [ ] Revue de sécurité, `npm audit`
- [ ] `REPORT.md` finalisé

## Idées pour plus tard (hors périmètre)

- Commentaires et votes sur les fiches
- Notifications en temps réel (WebSocket)
- Vérification de l'adresse e-mail, mot de passe oublié
- Envoi des fichiers en flux vers le stockage
