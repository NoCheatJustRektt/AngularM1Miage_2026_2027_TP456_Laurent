# Rapport du projet StudyShare

> Rapport exigé par le sujet du TP4 : travail effectué, choix techniques, fonctionnalités implémentées et résultats des tests.
> Ce document est complété à la fin de chaque étape. Il résume les documents de `docs/` et renvoie vers eux pour le détail.

**Dernière mise à jour :** 2026-11-04 — fin de l'étape 0 (mise en place).

## 1. Présentation

StudyShare est une plateforme web de partage de fiches de révision entre étudiants : dépôt de fichiers, visibilité publique ou privée, amis, groupes de révision, partage révocable, recherche et fil d'activité. Détail : [docs/PRESENTATION.md](docs/PRESENTATION.md).

## 2. Démarche

Conformément au sujet, le projet a d'abord été discuté avec l'assistant IA (Claude Code) avant toute implémentation :

1. **Fonctionnalités souhaitées** → [docs/FONCTIONNALITES.md](docs/FONCTIONNALITES.md)
2. **Interfaces utilisateur** → écrans et choix d'interface dans [docs/FONCTIONNALITES.md](docs/FONCTIONNALITES.md)
3. **Implémentation et choix techniques** → [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/DECISIONS.md](docs/DECISIONS.md)
4. **Découpage du travail** → [docs/ROADMAP.md](docs/ROADMAP.md)

Les prompts envoyés à l'IA pendant le développement sont tracés dans [docs/RAPPORT_IA.md](docs/RAPPORT_IA.md).

## 3. Travail effectué

| Étape | Contenu | État |
|---|---|---|
| Conception | Sujet, fonctionnalités, architecture, choix d'hébergement et de stockage, documentation | ✅ Terminée |
| 0. Mise en place | Structure du projet, outillage, API minimale, application Angular, premiers tests | ✅ Terminée |
| 1 à 8 | Voir [docs/ROADMAP.md](docs/ROADMAP.md) | 🔲 À faire |

### Organisation du travail

Le dépôt suit le schéma `main` ← `develop` ← branches de travail (`feature/…`, `fix/…`, `chore/…`…). Chaque branche est fusionnée dans `develop` après validation de l'auteur ; seul l'auteur fusionne dans `main`. Un hook Claude Code empêche l'assistant IA de travailler directement sur `main` ou `develop` (ADR-016).

### Étape 0 — Mise en place

**Objectif :** un projet qui démarre, se teste et se vérifie automatiquement, avant toute fonctionnalité.

**Réalisé :**
- **Monorepo npm** (workspaces) : `shared` (types et constantes communs), `server` (API Express), `client` (Angular).
- **Outillage commun** : TypeScript strict, ESLint (TypeScript, Angular, ordre des imports), Prettier, `.editorconfig`, fins de ligne LF imposées par `.gitattributes`.
- **API Express** : configuration validée au démarrage (Zod), gestion centralisée des erreurs au format `{ error: { code, message, details } }`, middleware de validation (messages en français), en-têtes de sécurité (helmet), CORS limité au front, interface de stockage avec une implémentation en mémoire, route `GET /api/health` (avec vérification de MongoDB et du stockage via `deep=1`).
- **Application Angular 22** : thème Material 3, structure de page (barre du haut, menu latéral replié sur téléphone), page d'accueil qui affiche l'état du serveur, proxy `/api` en développement.
- **Tests** : 49 tests unitaires (Vitest), une base MongoDB en mémoire pour les tests, aucun service externe nécessaire.
- **Intégration continue** : GitHub Actions lance le lint, les tests et le build à chaque push.

**Difficulté :** Angular 22 exige Node.js 22.22.3 ou plus récent ; la machine avait Node 22.19. Node.js a été mis à jour en version 26 LTS (ADR-017).

## 4. Choix techniques principaux

| Sujet | Choix | Pourquoi (résumé) |
|---|---|---|
| Langage | TypeScript partout, types partagés | Erreurs détectées à la compilation entre front et back |
| Architecture | Découpage par fonctionnalité, front et back | Lisible et facile à faire évoluer étape par étape |
| Base de données | MongoDB Atlas + Mongoose | Adapté aux fiches avec tags et fichiers ; recherche plein texte |
| Stockage | Supabase Storage, bucket privé | Gratuit sans carte bancaire, URLs signées |
| Hébergement | Render | Express fonctionne comme en local, déploiement automatique |
| Fichiers | Envoi via Express, téléchargement par URL signée | Simple, aucun fichier orphelin, partage vraiment révocable |
| Authentification | JWT (en-tête Bearer) | Simple et sans état côté serveur |
| État du front | Stores à base de signals | Suffisant, sans la lourdeur de NgRx |
| Tests | Vitest, Supertest, MongoDB en mémoire | Un seul outil, tests sans connexion internet |
| Versions | Node 26, Angular 22, TypeScript 6.0, Express 5 | Dernières versions stables au début du projet |

Détail et alternatives étudiées : [docs/DECISIONS.md](docs/DECISIONS.md).

## 5. Fonctionnalités implémentées

| Fonctionnalité | Étape | État |
|---|---|---|
| État du serveur (`GET /api/health`, affiché sur la page d'accueil) | 0 | ✅ |
| Structure de page (barre du haut, menu, version téléphone) | 0 | ✅ |
| Fonctionnalités utilisateur (comptes, fiches, partage…) | 1 à 8 | 🔲 |

## 6. Résultats des tests

Détail par fichier de test : [docs/TESTS.md](docs/TESTS.md).

| Date | Suite | Tests | Réussis | Échoués | Couverture (lignes) |
|---|---|---|---|---|---|
| 2026-11-04 | Serveur | 38 | 38 | 0 | 95,2 % |
| 2026-11-04 | Client | 11 | 11 | 0 | 97,0 % |

Le lint (`npm run lint`) et la compilation de production (`npm run build`) passent également.

## 7. Utilisation de l'IA

_À compléter : bilan de l'utilisation de Claude Code (ce qui a bien fonctionné, ce qui a dû être corrigé, part du travail)._

## 8. Difficultés rencontrées

_À compléter._

## 9. Perspectives

_À compléter : fonctionnalités bonus non réalisées, améliorations possibles._
