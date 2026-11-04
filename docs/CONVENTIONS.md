# Conventions de code

> Règles **obligatoires** pour tout le code du projet, qu'il soit écrit par un humain ou par l'assistant IA.
> En cas de doute, suivre l'exemple du code existant le plus proche.

## 1. Langue

| Élément | Langue | Exemple |
|---|---|---|
| Noms de fichiers, dossiers, variables, fonctions, classes, types | Anglais | `sheet.service.ts`, `createSheet()` |
| Routes de l'API, champs JSON, codes d'erreur | Anglais | `/api/sheets/shared-with-me`, `SHEET_NOT_FOUND` |
| Messages de commit, noms de branches | Anglais | `feat(sheets): add file upload` |
| Commentaires dans le code | Français | `// Le propriétaire voit sa fiche quel que soit son état.` |
| Textes affichés à l'utilisateur, messages d'erreur `message` | Français | « Ce fichier dépasse 20 Mo. » |
| Documentation (`docs/`, `README.md`, `REPORT.md`) | Français | — |
| Noms des tests (`describe`, `it`) | Français | `it('refuse un fichier qui n\'est pas un vrai PDF')` |

## 2. Nommage

### Fichiers et dossiers

| Règle | Exemple |
|---|---|
| Tout en `kebab-case` (minuscules, tirets) | `sheet-search.service.ts`, `file-dropzone/` |
| Forme `<nom>.<rôle>.ts` | `sheet.policy.ts`, `auth.guard.ts`, `file-size.pipe.ts` |
| Tests à côté du fichier testé, suffixe `.spec.ts` | `sheet.policy.ts` → `sheet.policy.spec.ts` |
| Back-end : dossier de module au **pluriel**, fichiers au **singulier** | `modules/sheets/sheet.service.ts` |
| Front-end : fichiers de données au **pluriel** (nom de la fonctionnalité) | `features/sheets/data/sheets.api.ts` |
| Un composant Angular = un dossier du même nom | `sheet-card/sheet-card.component.ts` |

### Rôles de fichiers autorisés

| Back-end | Front-end |
|---|---|
| `.routes`, `.controller`, `.service`, `.model`, `.schemas`, `.policy`, `.state`, `.mapper`, `.listeners`, `.middleware`, `.storage` | `.component`, `.page`, `.api`, `.store`, `.service`, `.guard`, `.interceptor`, `.pipe`, `.directive`, `.routes` |

Shared : `.types`, `.constants`.

### Dans le code

| Élément | Convention | Exemple |
|---|---|---|
| Variables, fonctions, méthodes, propriétés | `camelCase` | `storageUsed`, `buildVisibleSheetsFilter()` |
| Classes, interfaces, types, composants | `PascalCase` (pas de préfixe `I`) | `AppError`, `Sheet`, `SheetCardComponent` |
| Constantes globales | `UPPER_SNAKE_CASE` | `MAX_FILE_SIZE_MB`, `REPORT_THRESHOLD` |
| Booléens | Préfixe `is`, `has`, `can`, `should` | `isOwner`, `canViewSheet`, `hasFiles` |
| Fonctions | Verbe d'action | `createSheet`, `revokeShare`, `assertTransition` |
| Valeurs d'énumération (types union de chaînes) | `kebab-case` ou un mot en minuscules | `'draft'`, `'computer-science'` |
| Événements internes | `domaine.action` au passé | `'sheet.published'`, `'friendship.accepted'` |
| Codes d'erreur | `UPPER_SNAKE_CASE` | `QUOTA_EXCEEDED` |
| Sélecteurs Angular | Préfixe `app-` | `app-sheet-card` |
| Classes Angular | Suffixe selon le rôle | `LoginPage`, `SheetCardComponent`, `SheetsApi`, `SheetsStore`, `FileSizePipe` |
| Guards et interceptors fonctionnels | `camelCase` + rôle | `authGuard`, `authInterceptor` |
| Variables d'environnement | `UPPER_SNAKE_CASE` | `MONGODB_URI`, `SUPABASE_BUCKET` |

### API REST

| Règle | Exemple |
|---|---|
| Noms au **pluriel**, en `kebab-case` | `/api/sheets`, `/api/friends/requests` |
| Paramètres de chemin explicites | `:sheetId`, `:fileId` (jamais `:id` seul) |
| Champs JSON en `camelCase` | `downloadsCount`, `targetType` |
| Méthodes HTTP | `GET` lire · `POST` créer · `PATCH` modifier en partie · `PUT` remplacer ou rendre idempotent · `DELETE` supprimer |
| Codes de réponse | `200` OK · `201` créé · `204` sans contenu · `302` redirection · erreurs : voir [APIs.md](APIs.md) |

### MongoDB

- Collections au pluriel, en minuscules (nom par défaut de Mongoose) : `users`, `sheets`.
- Modèles Mongoose : `UserModel`, `SheetModel` ; types des documents : `UserDocument`, `SheetDocument`.

## 3. TypeScript

- Mode **`strict`** activé partout ; pas de `// @ts-ignore`.
- **`any` interdit.** Utiliser `unknown` puis vérifier le type.
- Types communs au front et au back dans `shared/` uniquement, importés via `@studyshare/shared`.
- `type` pour les unions et objets simples, `interface` pour les objets extensibles : choisir la même forme que les fichiers voisins.
- Pas d'énumérations `enum` : des unions de chaînes + un tableau de constantes.
  ```ts
  export const SHEET_STATUSES = ['draft', 'published', 'reported', 'archived'] as const;
  export type SheetStatus = (typeof SHEET_STATUSES)[number];
  ```
- Imports : modules Node, puis bibliothèques, puis `@studyshare/shared`, puis fichiers du projet, séparés par une ligne vide (ordre vérifié par ESLint, règle `simple-import-sort`).
- **`shared` et `server` sont en modules ES (NodeNext)** : les imports relatifs se terminent par **`.js`**, même si le fichier source est en `.ts` (`import { AppError } from '../errors.js'`). Côté Angular, pas d'extension.
- Les modules Node s'importent avec le préfixe `node:` (`import { existsSync } from 'node:fs'`).
- Imports de types avec `import type` (règle `consistent-type-imports`).
- `async` / `await` partout, pas de `.then()` enchaînés.

## 4. Mise en forme

Vérifiée automatiquement par **Prettier** et **ESLint** (`npm run lint`).

| Règle | Valeur |
|---|---|
| Indentation | 2 espaces |
| Guillemets | Simples `'…'` |
| Points-virgules | Oui |
| Longueur de ligne | 100 caractères |
| Virgule finale | Oui (`trailingComma: all`) |
| Fin de ligne | LF |
| Encodage | UTF-8 |

## 5. Back-end

- **Une couche, un rôle** (détail dans [ARCHITECTURE.md](ARCHITECTURE.md#3-back-end--organisation-dun-module)) : les routes déclarent, le controller traduit HTTP, le service décide.
- **Les services ne connaissent pas `req` ni `res`.** Ils reçoivent des données typées et renvoient des données ou lèvent une erreur.
- **Erreurs :** toujours `throw new AppError(status, 'CODE', 'Message en français')`. Jamais de `res.status(...)` dans un service. Le middleware d'erreurs fait la réponse.
- **Validation :** toute entrée (`body`, `query`, `params`) passe par un schéma Zod dans `*.schemas.ts` et le middleware `validate`. Dans le controller, les valeurs validées se lisent avec `validated(schema, req.query)`, qui leur donne le bon type.
- **Accès aux fiches :** toujours via `sheet.policy.ts`. Une requête de liste utilise `buildVisibleSheetsFilter`.
- **Configuration :** seule `config/env.ts` lit `process.env`. Les autres fichiers importent `env`.
- **Stockage :** toujours via l'interface `StorageService` (`storage/index.ts`), jamais directement via Supabase.
- **Réponses :** toujours via un `*.mapper.ts`. Ne jamais renvoyer un document Mongoose brut (risque de fuite de `passwordHash` ou de `storageKey`).
- **Fonctions des services :** exportées une par une (`export async function createSheet(...)`), importées en bloc dans le controller (`import * as sheetService from './sheet.service'`).

## 6. Front-end (Angular)

- Composants **standalone** uniquement, avec `changeDetection: ChangeDetectionStrategy.OnPush`.
- Injection avec **`inject()`**, pas de paramètres de constructeur.
- Entrées et sorties avec **`input()`**, **`output()`** et **`model()`**.
- État avec des **signals** (`signal`, `computed`) ; `toSignal()` pour convertir un Observable.
- Contrôle de flux **`@if`, `@for` (avec `track`), `@switch`** dans les gabarits.
- **Formulaires réactifs typés** (`FormBuilder.nonNullable`), avec les messages d'erreur de `shared/utils/form-errors.ts`.
- **Pas de `subscribe()` dans les composants** quand c'est évitable. Sinon, `takeUntilDestroyed()`.
- **Pages** (`*.page.ts`) : récupèrent les données via un store. **Composants** (`*.component.ts`) : reçoivent des données et émettent des événements, sans appel HTTP.
- Les appels HTTP sont **uniquement** dans les fichiers `*.api.ts`.
- Gabarits et styles dans des fichiers séparés (`.html`, `.scss`), sauf composant de moins de 10 lignes de gabarit.
- Pas de `innerHTML` avec du contenu venant de l'utilisateur.
- Composants Angular Material plutôt que des composants faits main quand ils existent.
- Accessibilité : chaque champ a un libellé, chaque bouton icône a un `aria-label`.

## 7. Tests

- **Chaque nouvelle fonctionnalité a des tests unitaires**, écrits dans la même tâche (exigence du sujet).
- Un fichier testé = un fichier `.spec.ts` à côté.
- Les fonctions de test s'importent explicitement : `import { describe, expect, it } from 'vitest'`.
- Structure **Préparer / Agir / Vérifier**, une seule raison d'échouer par test.
- Noms en français, qui décrivent le comportement : `it('renvoie 404 pour une fiche privée non partagée')`.
- Tester les **cas d'erreur** autant que les cas normaux (droits, validations, transitions interdites).
- Aucun test ne dépend d'internet ni d'un compte cloud : MongoDB en mémoire, stockage `memory`.
- Les données de test sont créées avec `server/src/tests/factories.ts`.
- Détail de la stratégie : [TESTS.md](TESTS.md).

## 8. Git

### Organisation des branches

```
main      ← version stable, déployée. Fusions faites UNIQUEMENT par l'utilisateur
  ▲
develop   ← intégration. Reçoit les branches de travail APRÈS validation de l'utilisateur
  ▲
feature/… fix/… enhancement/… docs/… chore/… refactor/… test/…   ← tout le travail se fait ici
```

| Branche | Créée depuis | Fusionnée dans | Par qui |
|---|---|---|---|
| `main` | — | — | L'utilisateur fusionne `develop` dans `main` |
| `develop` | `main` | `main` | L'utilisateur |
| Branche de travail | `develop` | `develop` | Claude, **seulement après la validation de l'utilisateur** |

### Types de branches de travail

| Type | Usage | Exemple | Type de commit associé |
|---|---|---|---|
| `feature/` | Nouvelle fonctionnalité | `feature/02-sheets-upload` | `feat` |
| `fix/` | Correction de bug | `fix/upload-progress-bar` | `fix` |
| `enhancement/` | Amélioration d'une fonctionnalité existante (interface, performance, ergonomie) | `enhancement/search-filters-ui` | `feat` ou `refactor` |
| `docs/` | Documentation seule | `docs/project-documentation` | `docs` |
| `chore/` | Outillage, dépendances, configuration, CI | `chore/github-actions` | `chore` |
| `refactor/` | Réorganisation du code sans changement de comportement | `refactor/sheet-service-split` | `refactor` |
| `test/` | Ajout ou correction de tests seuls | `test/share-policy-cases` | `test` |

**Format du nom :** `<type>/<description>`, en minuscules et en `kebab-case` (lettres, chiffres, `-`, `.`). Pour une étape de la feuille de route, la description commence par son numéro sur deux chiffres : `feature/04-friends`.

### Cycle de vie d'une branche de travail

1. **Partir de `develop` à jour :** `git switch develop`, `git pull`, puis `git switch -c feature/04-friends`.
2. **Travailler et committer** sur la branche (commits petits et réguliers).
3. **Terminer :** tests au vert, lint au vert, documentation à jour.
4. **Demander la validation** de l'utilisateur, avec un résumé des changements et les résultats des tests.
5. **Après le « oui » de l'utilisateur seulement :** `git switch develop`, `git merge --no-ff feature/04-friends` (le `--no-ff` garde la trace de la branche dans l'historique), puis suppression de la branche locale : `git branch -d feature/04-friends`.
6. **Fusion dans `main` :** faite par l'utilisateur, quand il le décide.

### Garde-fous automatiques

Le hook Claude Code `.claude/hooks/guard-git.mjs` fait respecter ces règles pendant que Claude travaille :

| Action de Claude | Sur `main` | Sur `develop` | Sur une branche de travail |
|---|---|---|---|
| Modifier un fichier du projet | ❌ refusé | ❌ refusé | ✅ |
| `git commit` | ❌ refusé | ❌ refusé | ✅ |
| `git merge` | ❌ refusé | ⚠️ demande la validation de l'utilisateur | ✅ |
| `git rebase`, `reset`, `cherry-pick`, `revert` | ❌ refusé | ❌ refusé | ✅ |
| `git push` vers `main` | ❌ refusé | ❌ refusé | ❌ refusé |
| `git push` vers `develop` | — | ⚠️ demande la validation | ⚠️ demande la validation |
| `git push --force` | — | — | ⚠️ demande la validation |
| Supprimer ou renommer `main` ou `develop` | ❌ refusé | ❌ refusé | ❌ refusé |
| Créer une branche au nom non conforme | ❌ refusé | ❌ refusé | ❌ refusé |

Ces garde-fous ne concernent que Claude : l'utilisateur garde la main sur ses propres commandes git.

### Messages de commit : Conventional Commits, en anglais

```
<type>(<portée>): <description à l'impératif, en minuscules>
```

| Type | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `test` | Ajout ou modification de tests |
| `docs` | Documentation seule |
| `refactor` | Changement de code sans changement de comportement |
| `chore` | Outillage, dépendances, configuration |
| `style` | Mise en forme seule |

Portées : `server`, `client`, `shared`, `auth`, `users`, `sheets`, `friends`, `groups`, `shares`, `activity`, `moderation`, `docs`, `ci`, `deploy`.

Exemples : `feat(sheets): add sheet creation with file upload`, `test(shares): cover share revocation`, `docs: update APIs for friends module`.

### Règles

- Jamais de secret dans un commit (`.env` est dans `.gitignore`).
- Le code committé compile, passe le lint et les tests.
- La documentation concernée est mise à jour dans le même commit.

## 9. Commentaires

- Expliquer le **pourquoi**, pas le quoi : le code doit se lire seul.
- Commentaire JSDoc (en français) sur chaque fonction exportée des fichiers `*.service.ts`, `*.policy.ts`, `*.state.ts` et `storage/`.
- Pas de code commenté laissé dans les fichiers.
- `// TODO:` autorisé seulement avec l'étape prévue : `// TODO(étape 7): masquer les fiches signalées`.
