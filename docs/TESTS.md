# Tests

> Stratégie de tests, commandes, et résultats datés.
> Le sujet exige **des tests unitaires pour toutes les nouvelles fonctionnalités**.

## 1. Outils

| Outil | Rôle |
|---|---|
| **Vitest** | Lanceur de tests et assertions, pour `shared`, `server` et `client` |
| **Supertest** | Appels HTTP sur l'application Express sans la démarrer sur un port |
| **mongodb-memory-server** | Une vraie base MongoDB en mémoire, recréée pour chaque fichier de test |
| **MemoryStorage** | Remplace Supabase dans les tests (`STORAGE_DRIVER=memory`) |
| **Angular TestBed** + `provideHttpClientTesting` | Tests des composants, stores, guards et interceptors |
| **@vitest/coverage-v8** | Mesure de la couverture |

Aucun test n'a besoin d'internet ni d'un compte cloud.

## 2. Commandes

| Commande | Effet |
|---|---|
| `npm test` | Compile `shared`, puis lance les tests du serveur et du client |
| `npm test -w server` | Tests du serveur seulement |
| `npm test -w client` | Tests du client seulement |
| `npm run test:coverage` | Tous les tests avec rapport de couverture (dossiers `server/coverage/` et `client/coverage/`) |
| `npm run test:watch -w server` | Relance les tests du serveur à chaque modification |

Le paquet `shared` ne contient pour l'instant que des types et des constantes : il n'a pas de tests propres.

### Fonctionnement côté serveur

- `vitest.config.ts` fixe les variables d'environnement de test (`NODE_ENV=test`, `STORAGE_DRIVER=memory`…). Le fichier `server/.env` n'est jamais chargé pendant les tests.
- `tests/global-setup.ts` démarre **une seule** base MongoDB en mémoire pour toute la suite. Le premier lancement télécharge le binaire MongoDB (mis en cache ensuite).
- `tests/setup.ts` connecte chaque fichier de test à **sa propre base**, vidée après chaque test et supprimée à la fin.

### Fonctionnement côté client

`ng test` utilise le constructeur de tests d'Angular avec **Vitest** et **jsdom** (pas de navigateur à installer).

## 3. Ce qu'on teste, et à quel niveau

| Niveau | Cible | Exemples |
|---|---|---|
| **Unitaire, fonctions pures** | `*.policy.ts`, `*.state.ts`, mappers, utilitaires, pipes | `canViewSheet` dans chaque cas ; chaque transition d'état, autorisée ou refusée |
| **Unitaire, services** | `*.service.ts` avec MongoDB en mémoire et `MemoryStorage` | Création d'une fiche, quota, suppression des fichiers orphelins si l'enregistrement échoue |
| **Routes** | `*.routes.spec.ts` avec Supertest | Codes HTTP, format des erreurs, authentification exigée, validation des entrées |
| **Front, logique** | Stores, guards, interceptors, `*.api.ts` | Le guard redirige vers `/login` ; l'interceptor n'ajoute le jeton qu'aux appels `/api` |
| **Front, composants** | Pages et composants | Le formulaire affiche les erreurs ; la zone de dépôt refuse un fichier trop gros ; la pastille affiche la bonne couleur |

### Cas obligatoires pour chaque nouvelle route

1. le cas normal (succès) ;
2. sans jeton → `401` ;
3. entrée invalide → `400 VALIDATION_ERROR` ;
4. accès refusé (pas propriétaire, pas ami, pas membre, mauvais rôle) ;
5. ressource inexistante ou invisible → `404` ;
6. chaque erreur métier documentée dans [APIs.md](APIs.md).

### Priorité absolue : la règle d'accès

La matrice suivante est entièrement couverte par `sheet.policy.spec.ts` et par des tests de routes :

| Lecteur \ Fiche | Brouillon | Publiée publique | Publiée privée | Signalée | Archivée |
|---|---|---|---|---|---|
| Propriétaire | ✔ | ✔ | ✔ | ✔ | ✔ |
| Ami avec partage direct actif | ✘ | ✔ | ✔ | ✘ | ✘ |
| Membre d'un groupe avec partage actif | ✘ | ✔ | ✔ | ✘ | ✘ |
| Ancien destinataire (partage arrêté) | ✘ | ✔ | ✘ | ✘ | ✘ |
| Autre utilisateur | ✘ | ✔ | ✘ | ✘ | ✘ |
| Modérateur | ✘ | ✔ | ✘ | ✔ | ✘ |

## 4. Règles d'écriture

- Un fichier `.spec.ts` à côté de chaque fichier testé.
- Noms en français décrivant le comportement attendu.
- Structure Préparer / Agir / Vérifier.
- Données créées avec `server/src/tests/factories.ts` (`createUser()`, `createSheet({ visibility: 'private' })`, `createFriendship(a, b)`…).
- Fichiers de test réels dans `server/src/tests/fixtures/` : un petit PDF, une petite image PNG et un « faux PDF » (texte renommé).
- Chaque test est indépendant : la base est vidée entre les tests.

## 5. Objectifs de couverture

| Zone | Objectif |
|---|---|
| `*.policy.ts`, `*.state.ts` | 100 % |
| Services et routes du serveur | ≥ 80 % |
| Client (stores, guards, interceptors) | ≥ 80 % |
| Client (composants) | ≥ 60 % |

## 6. Intégration continue

GitHub Actions (`.github/workflows/ci.yml`) lance `npm run lint` et `npm test` à chaque push et chaque pull request. Un push dont les tests échouent ne doit pas être déployé.

## 7. Résultats

> Mis à jour à chaque fois que les tests sont lancés à la fin d'une tâche. Le plus récent en haut.

| Date | Étape | Suite | Tests | Réussis | Échoués | Couverture (lignes) | Remarques |
|---|---|---|---|---|---|---|---|
| 2026-11-04 | 0 | server (6 fichiers) | 38 | 38 | 0 | 95,2 % (instructions 92,6 %) | Seule partie peu couverte : `logger.ts`, muet pendant les tests |
| 2026-11-04 | 0 | client (4 fichiers) | 11 | 11 | 0 | 97,0 % (instructions 96,5 %) | — |

### Détail de l'étape 0

| Fichier de test | Ce qui est vérifié |
|---|---|
| `server/src/config/env.spec.ts` (8) | Valeurs par défaut, conversion du port, refus d'un port, d'une URI MongoDB ou d'un pilote de stockage invalides, variables obligatoires en production |
| `server/src/core/middlewares/error-handler.middleware.spec.ts` (6) | Format `{ error: { code, message, details } }`, erreurs asynchrones, 500 sans détail technique, JSON mal formé (400), corps trop gros (413), route inconnue (404) |
| `server/src/core/middlewares/validate.middleware.spec.ts` (6) | Conversion et valeurs par défaut, 400 avec le champ fautif, erreurs regroupées, messages en français, requête valide |
| `server/src/storage/memory.storage.spec.ts` (7) | Envoi, remplacement, URL de téléchargement avec nom et expiration, fichier absent, suppression, santé, instance unique |
| `server/src/modules/health/health.routes.spec.ts` (7) | 200 simple, accès sans connexion, `deep=1` et `deep=true`, 503 si le stockage ou la base ne répond pas, `deep` invalide |
| `server/src/app.spec.ts` (4) | En-têtes de sécurité, CORS autorisé pour le front et refusé ailleurs, 404 au format JSON |
| `client/src/app/app.component.spec.ts` (1) | Le composant racine affiche la structure de page |
| `client/src/app/core/layout/shell/shell.component.spec.ts` (4) | Nom et lien d'accueil, menu, menu toujours ouvert sur ordinateur, bouton ☰ sur téléphone |
| `client/src/app/core/health/health.api.spec.ts` (1) | Appel `GET /api/health` |
| `client/src/app/features/home/pages/home/home.page.spec.ts` (5) | Titre, état « connexion », « le serveur répond », « ne répond pas » avec bouton Réessayer, nouvelle tentative |
