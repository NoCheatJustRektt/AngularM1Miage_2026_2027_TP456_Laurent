# API de StudyShare

> Liste de toutes les routes de l'API Express.
> État : 🔲 prévue · 🔄 en cours · ✅ implémentée et testée
> Modèle de données : [MODELE_DONNEES.md](MODELE_DONNEES.md). Règle d'accès : [MODELE_DONNEES.md#règle-daccès](MODELE_DONNEES.md#règle-daccès).

## Règles générales

| Sujet | Règle |
|---|---|
| Adresse de base | `/api` (développement : `http://localhost:3000/api`) |
| Format | JSON (`Content-Type: application/json`), sauf envoi de fichiers (`multipart/form-data`) |
| Authentification | En-tête `Authorization: Bearer <jeton JWT>`. **Toutes les routes l'exigent**, sauf celles marquées « Public » |
| Identifiants | Chaînes de 24 caractères hexadécimaux (ObjectId). Un identifiant mal formé renvoie `400 INVALID_ID` |
| Dates | Format ISO 8601 (`2026-11-04T18:30:00.000Z`) |
| Pagination | Paramètres `page` (défaut 1) et `limit` (défaut 20, maximum 50). Réponse : `{ "items": [...], "page": 1, "limit": 20, "total": 134 }` |
| Fiche invisible | Une fiche que l'utilisateur n'a pas le droit de voir renvoie `404 SHEET_NOT_FOUND`, comme si elle n'existait pas |

### Format des erreurs

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Le titre doit contenir au moins 3 caractères.",
    "details": [{ "field": "title", "message": "Au moins 3 caractères" }]
  }
}
```

### Erreurs communes à toutes les routes

| Code HTTP | `code` | Quand |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Contenu de la requête invalide (`details` liste les champs) |
| 400 | `INVALID_ID` | Identifiant mal formé |
| 401 | `UNAUTHENTICATED` | Jeton absent, invalide ou expiré |
| 403 | `FORBIDDEN` | Connecté mais pas le droit (rôle, propriétaire) |
| 404 | `ROUTE_NOT_FOUND` | Route inexistante |
| 429 | `TOO_MANY_REQUESTS` | Trop de tentatives (connexion, inscription) |
| 500 | `INTERNAL_ERROR` | Erreur inattendue (aucun détail technique renvoyé) |

### Objets renvoyés

| Objet | Contenu |
|---|---|
| `User` | `id`, `username`, `email`, `role`, `program`, `level`, `bio`, `storageUsed`, `createdAt` (seulement pour soi-même) |
| `PublicUser` | `id`, `username`, `program`, `level`, `bio` |
| `Sheet` | `id`, `title`, `description`, `subject`, `level`, `tags`, `owner` (`PublicUser`), `visibility`, `status`, `archivedByModerator`, `files` (`SheetFile[]`), `downloadsCount`, `publishedAt`, `createdAt`, `updatedAt` |
| `SheetSummary` | Comme `Sheet`, sans `description` ; `files` réduit à `fileCount` et `fileTypes` (pour les listes) |
| `SheetFile` | `id`, `originalName`, `mimeType`, `size` (jamais `storageKey`) |
| `Share` | `id`, `targetType`, `target` (`PublicUser` ou `{ id, name }` du groupe), `createdAt` |
| `Group` | `id`, `name`, `description`, `owner` (`PublicUser`), `members` (`PublicUser[]`), `createdAt` |
| `Activity` | `id`, `type`, `actor` (`PublicUser`), `sheet` (`SheetSummary`), `targetUser`, `group`, `createdAt` |

---

## Santé

| État | Méthode | Chemin | Accès | Étape |
|---|---|---|---|---|
| 🔲 | GET | `/api/health` | Public | 0 |

### `GET /api/health`

- **Paramètre facultatif :** `deep=1` vérifie aussi MongoDB et Supabase.
- **200** `{ "status": "ok", "uptime": 123.4 }` — avec `deep=1` : `{ "status": "ok", "database": "ok", "storage": "ok" }`
- **503** `SERVICE_UNAVAILABLE` si la base ou le stockage ne répond pas (avec `deep=1`).

---

## Authentification

| État | Méthode | Chemin | Accès | Étape |
|---|---|---|---|---|
| 🔲 | POST | `/api/auth/register` | Public | 1 |
| 🔲 | POST | `/api/auth/login` | Public | 1 |
| 🔲 | GET | `/api/auth/me` | Connecté | 1 |

### `POST /api/auth/register`

- **Corps :** `{ "username": "lea.martin", "email": "lea@exemple.fr", "password": "motdepasse1" }`
- **Conditions :** nom d'utilisateur 3 à 30 caractères `[a-z0-9._-]` ; e-mail valide ; mot de passe ≥ 8 caractères avec au moins une lettre et un chiffre. Limité à 10 tentatives par heure et par adresse IP.
- **201** `{ "token": "…", "user": User }`
- **Erreurs :** `409 USERNAME_TAKEN`, `409 EMAIL_TAKEN`

### `POST /api/auth/login`

- **Corps :** `{ "email": "lea@exemple.fr", "password": "motdepasse1" }`
- **Conditions :** limité à 10 tentatives par 15 minutes et par adresse IP.
- **200** `{ "token": "…", "user": User }` — le jeton expire après 7 jours.
- **Erreurs :** `401 INVALID_CREDENTIALS` (même message que l'e-mail ou le mot de passe soit faux)

### `GET /api/auth/me`

- **200** `User` — l'utilisateur correspondant au jeton.

---

## Utilisateurs

| État | Méthode | Chemin | Accès | Étape |
|---|---|---|---|---|
| 🔲 | PATCH | `/api/users/me` | Connecté | 1 |
| 🔲 | GET | `/api/users/me/quota` | Connecté | 2 |
| 🔲 | GET | `/api/users/search` | Connecté | 4 |
| 🔲 | GET | `/api/users/:userId` | Connecté | 4 |

### `PATCH /api/users/me`

- **Corps (tout facultatif) :** `{ "program": "MIAGE", "level": "M1", "bio": "…" }`
- **200** `User`

### `GET /api/users/me/quota`

- **200** `{ "used": 12582912, "limit": 52428800 }` (en octets)

### `GET /api/users/search?q=lea`

- **Conditions :** `q` de 2 caractères au moins ; cherche dans `username` ; s'exclut soi-même ; 20 résultats au maximum.
- **200** `[{ ...PublicUser, "relation": "none" | "friend" | "request_sent" | "request_received" }]`

### `GET /api/users/:userId`

- **200** `PublicUser` avec `relation` et `publicSheetsCount`
- **Erreurs :** `404 USER_NOT_FOUND`

---

## Fiches

| État | Méthode | Chemin | Accès | Étape |
|---|---|---|---|---|
| 🔲 | POST | `/api/sheets` | Connecté | 2 |
| 🔲 | GET | `/api/sheets/mine` | Connecté | 2 |
| 🔲 | GET | `/api/sheets/:sheetId` | Règle d'accès | 2 |
| 🔲 | PATCH | `/api/sheets/:sheetId` | Propriétaire | 2 |
| 🔲 | DELETE | `/api/sheets/:sheetId` | Propriétaire | 2 |
| 🔲 | PATCH | `/api/sheets/:sheetId/status` | Propriétaire | 2 |
| 🔲 | POST | `/api/sheets/:sheetId/files` | Propriétaire | 2 |
| 🔲 | DELETE | `/api/sheets/:sheetId/files/:fileId` | Propriétaire | 2 |
| 🔲 | GET | `/api/sheets/:sheetId/files/:fileId/download` | Règle d'accès | 2 |
| 🔲 | GET | `/api/sheets/recent` | Connecté | 3 |
| 🔲 | GET | `/api/sheets/search` | Connecté | 3 |
| 🔲 | GET | `/api/sheets/shared-with-me` | Connecté | 5 |
| 🔲 | GET | `/api/users/:userId/sheets` | Connecté | 4 |

### `POST /api/sheets`

- **Corps (`multipart/form-data`) :**
  - `title` (requis), `description`, `subject` (requis), `level` (requis), `visibility` (`public` | `private`, défaut `private`) ;
  - `tags` : tableau JSON en texte, par exemple `["sql","jointures"]` ;
  - `files` : 1 à 5 fichiers PDF, PNG ou JPG, 20 Mo au maximum chacun.
- **Conditions :** contenu réel des fichiers vérifié ; quota de l'utilisateur non dépassé. La fiche est créée à l'état `draft`.
- **201** `Sheet`
- **Erreurs :** `400 NO_FILE`, `400 TOO_MANY_FILES`, `413 FILE_TOO_LARGE`, `415 UNSUPPORTED_FILE_TYPE`, `403 QUOTA_EXCEEDED`

### `GET /api/sheets/mine?status=draft&page=1`

- **Paramètres :** `status` facultatif (`draft`, `published`, `reported`, `archived`) ; pagination.
- **200** `Paginated<SheetSummary>` — mes fiches, triées par dernière modification.

### `GET /api/sheets/:sheetId`

- **Conditions :** `canViewSheet` (propriétaire ; modérateur si signalée ; publiée et publique ; publiée et partagée avec moi ou un de mes groupes).
- **200** `Sheet`
- **Erreurs :** `404 SHEET_NOT_FOUND`

### `PATCH /api/sheets/:sheetId`

- **Corps (tout facultatif) :** `title`, `description`, `subject`, `level`, `tags`, `visibility`
- **Conditions :** propriétaire ; fiche pas à l'état `reported`.
- **200** `Sheet`
- **Erreurs :** `404 SHEET_NOT_FOUND`, `403 FORBIDDEN`, `409 SHEET_LOCKED`

### `DELETE /api/sheets/:sheetId`

- **Conditions :** propriétaire.
- **Effets :** supprime les fichiers dans Supabase, les partages, signalements, activités et favoris liés ; libère le quota.
- **204** (pas de contenu)

### `PATCH /api/sheets/:sheetId/status`

- **Corps :** `{ "status": "published" }`
- **Conditions :** propriétaire ; transition autorisée par `sheet.state.ts` (`draft → published`, `published → draft`, `published → archived`, `archived → published` si pas archivée par un modérateur).
- **200** `Sheet`
- **Erreurs :** `409 INVALID_TRANSITION`, `409 ARCHIVED_BY_MODERATOR`

### `POST /api/sheets/:sheetId/files`

- **Corps (`multipart/form-data`) :** `files` (1 ou plusieurs)
- **Conditions :** propriétaire ; pas plus de 5 fichiers au total ; mêmes vérifications que la création.
- **201** `Sheet`
- **Erreurs :** comme `POST /api/sheets`, plus `409 SHEET_LOCKED`

### `DELETE /api/sheets/:sheetId/files/:fileId`

- **Conditions :** propriétaire ; il doit rester au moins un fichier.
- **200** `Sheet`
- **Erreurs :** `404 FILE_NOT_FOUND`, `409 LAST_FILE`

### `GET /api/sheets/:sheetId/files/:fileId/download`

- **Conditions :** `canViewSheet`.
- **Effets :** incrémente `downloadsCount` (sauf pour le propriétaire).
- **302** redirection vers une URL Supabase signée, valable 5 minutes, qui télécharge le fichier sous son nom d'origine.
- **Erreurs :** `404 SHEET_NOT_FOUND`, `404 FILE_NOT_FOUND`

### `GET /api/sheets/recent?limit=12`

- **Conditions :** fiches `published` et `public`, triées par `publishedAt` décroissant. `limit` de 1 à 50, défaut 12.
- **200** `SheetSummary[]`

### `GET /api/sheets/search`

- **Paramètres :** `q` (mots-clés), `subject`, `level`, `fileType` (`pdf` | `image`), `sort` (`relevance` | `recent` | `downloads`, défaut `relevance` si `q`, sinon `recent`), pagination.
- **Conditions :** uniquement les fiches visibles (`buildVisibleSheetsFilter`) : publiées et publiques, publiées et partagées avec moi, ou mes fiches publiées.
- **200** `Paginated<SheetSummary>`

### `GET /api/sheets/shared-with-me?page=1`

- **Conditions :** fiches `published` avec un partage actif vers moi ou un de mes groupes, triées par date de partage.
- **200** `Paginated<SheetSummary & { sharedBy: PublicUser, sharedVia: "direct" | { id, name } }>`

### `GET /api/users/:userId/sheets?page=1`

- **Conditions :** fiches de cet utilisateur qui me sont visibles.
- **200** `Paginated<SheetSummary>`

---

## Partages

| État | Méthode | Chemin | Accès | Étape |
|---|---|---|---|---|
| 🔲 | GET | `/api/sheets/:sheetId/shares` | Propriétaire | 5 |
| 🔲 | POST | `/api/sheets/:sheetId/shares` | Propriétaire | 5 |
| 🔲 | DELETE | `/api/sheets/:sheetId/shares/:shareId` | Propriétaire | 5 |

### `GET /api/sheets/:sheetId/shares`

- **200** `Share[]` — partages actifs de la fiche.

### `POST /api/sheets/:sheetId/shares`

- **Corps :** `{ "targetType": "user", "targetId": "…" }` ou `{ "targetType": "group", "targetId": "…" }`
- **Conditions :** propriétaire ; `user` : doit être un ami ; `group` : le propriétaire doit en être membre ; pas de partage actif identique.
- **201** `Share`
- **Erreurs :** `400 NOT_A_FRIEND`, `403 NOT_GROUP_MEMBER`, `404 GROUP_NOT_FOUND`, `409 ALREADY_SHARED`

### `DELETE /api/sheets/:sheetId/shares/:shareId`

- **Effets :** renseigne `revokedAt` ; l'accès est retiré immédiatement.
- **204**
- **Erreurs :** `404 SHARE_NOT_FOUND`

---

## Amis

| État | Méthode | Chemin | Accès | Étape |
|---|---|---|---|---|
| 🔲 | GET | `/api/friends` | Connecté | 4 |
| 🔲 | DELETE | `/api/friends/:userId` | Connecté | 4 |
| 🔲 | GET | `/api/friends/requests` | Connecté | 4 |
| 🔲 | POST | `/api/friends/requests` | Connecté | 4 |
| 🔲 | PATCH | `/api/friends/requests/:requestId` | Destinataire | 4 |
| 🔲 | DELETE | `/api/friends/requests/:requestId` | Expéditeur | 4 |

### `GET /api/friends`

- **200** `PublicUser[]` — mes amis, triés par nom.

### `DELETE /api/friends/:userId`

- **Effets :** supprime l'amitié ; arrête les partages directs dans les deux sens. Ne retire pas l'ami des groupes (le créateur du groupe le fait s'il le souhaite).
- **204**
- **Erreurs :** `404 NOT_FRIENDS`

### `GET /api/friends/requests?direction=received`

- **Paramètres :** `direction` = `received` (défaut) ou `sent`.
- **200** `[{ "id", "user": PublicUser, "createdAt" }]` — invitations en attente.

### `POST /api/friends/requests`

- **Corps :** `{ "userId": "…" }`
- **Conditions :** pas soi-même ; pas déjà amis ; pas d'invitation en attente dans ce sens. **Si l'autre utilisateur m'avait déjà invité, l'amitié est acceptée directement.**
- **201** `{ "id", "status": "pending" | "accepted" }`
- **Erreurs :** `400 CANNOT_FRIEND_SELF`, `404 USER_NOT_FOUND`, `409 ALREADY_FRIENDS`, `409 REQUEST_PENDING`

### `PATCH /api/friends/requests/:requestId`

- **Corps :** `{ "action": "accept" }` ou `{ "action": "decline" }`
- **Conditions :** je suis le destinataire ; invitation en attente.
- **Effets :** `accept` crée l'activité `friendship.accepted`.
- **200** `{ "id", "status" }`
- **Erreurs :** `404 REQUEST_NOT_FOUND`

### `DELETE /api/friends/requests/:requestId`

- **Conditions :** je suis l'expéditeur ; invitation en attente.
- **204**

---

## Groupes

| État | Méthode | Chemin | Accès | Étape |
|---|---|---|---|---|
| 🔲 | GET | `/api/groups` | Connecté | 5 |
| 🔲 | POST | `/api/groups` | Connecté | 5 |
| 🔲 | GET | `/api/groups/:groupId` | Membre | 5 |
| 🔲 | PATCH | `/api/groups/:groupId` | Créateur | 5 |
| 🔲 | DELETE | `/api/groups/:groupId` | Créateur | 5 |
| 🔲 | POST | `/api/groups/:groupId/members` | Créateur | 5 |
| 🔲 | DELETE | `/api/groups/:groupId/members/:userId` | Créateur, ou le membre lui-même | 5 |
| 🔲 | GET | `/api/groups/:groupId/sheets` | Membre | 5 |

### `GET /api/groups`

- **200** `Group[]` — les groupes dont je suis membre.

### `POST /api/groups`

- **Corps :** `{ "name": "BDD M1", "description": "…" }`
- **201** `Group` — je suis créateur et premier membre.

### `GET /api/groups/:groupId`

- **Conditions :** je suis membre (sinon `404 GROUP_NOT_FOUND`).
- **200** `Group`

### `PATCH /api/groups/:groupId`

- **Corps :** `name`, `description` (facultatifs)
- **200** `Group`

### `DELETE /api/groups/:groupId`

- **Effets :** arrête tous les partages vers ce groupe.
- **204**

### `POST /api/groups/:groupId/members`

- **Corps :** `{ "userId": "…" }`
- **Conditions :** je suis le créateur ; l'utilisateur est mon ami ; pas déjà membre ; 50 membres au maximum.
- **Effets :** activité `group.member_added`.
- **201** `Group`
- **Erreurs :** `400 NOT_A_FRIEND`, `409 ALREADY_MEMBER`, `409 GROUP_FULL`

### `DELETE /api/groups/:groupId/members/:userId`

- **Conditions :** le créateur retire un membre, ou un membre se retire lui-même. Le créateur ne peut pas se retirer.
- **204**
- **Erreurs :** `404 MEMBER_NOT_FOUND`, `409 OWNER_CANNOT_LEAVE`

### `GET /api/groups/:groupId/sheets?page=1`

- **200** `Paginated<SheetSummary>` — fiches publiées partagées avec ce groupe.

---

## Fil d'activité

| État | Méthode | Chemin | Accès | Étape |
|---|---|---|---|---|
| 🔲 | GET | `/api/activity/feed` | Connecté | 6 |

### `GET /api/activity/feed?page=1`

- **Conditions :** activités de mes amis, des 90 derniers jours, plus récentes d'abord. Une activité `sheet.published` n'apparaît que si la fiche m'est visible.
- **200** `Paginated<Activity>`

---

## Modération

| État | Méthode | Chemin | Accès | Étape |
|---|---|---|---|---|
| 🔲 | POST | `/api/sheets/:sheetId/reports` | Règle d'accès, sauf propriétaire | 7 |
| 🔲 | GET | `/api/moderation/sheets` | Modérateur | 7 |
| 🔲 | PATCH | `/api/moderation/sheets/:sheetId` | Modérateur | 7 |

### `POST /api/sheets/:sheetId/reports`

- **Corps :** `{ "reason": "copyright", "comment": "…" }` — `reason` parmi `inappropriate`, `copyright`, `spam`, `other`.
- **Conditions :** fiche visible ; je ne suis pas le propriétaire ; un seul signalement par personne et par fiche.
- **Effets :** au 3e signalement ouvert, la fiche passe à `reported`.
- **201** `{ "id", "sheetStatus": "published" | "reported" }`
- **Erreurs :** `403 CANNOT_REPORT_OWN_SHEET`, `409 ALREADY_REPORTED`

### `GET /api/moderation/sheets?page=1`

- **Conditions :** rôle `moderator`.
- **200** `Paginated<SheetSummary & { reports: [{ reason, comment, reporter: PublicUser, createdAt }] }>` — fiches à l'état `reported`, les plus anciennes d'abord.

### `PATCH /api/moderation/sheets/:sheetId`

- **Corps :** `{ "decision": "restore" }` ou `{ "decision": "archive" }`
- **Conditions :** rôle `moderator` ; fiche à l'état `reported`.
- **Effets :** `restore` → fiche `published`, signalements `rejected` ; `archive` → fiche `archived`, `archivedByModerator = true`, signalements `accepted`.
- **200** `Sheet`
- **Erreurs :** `409 INVALID_TRANSITION`

---

## Favoris (bonus)

| État | Méthode | Chemin | Accès | Étape |
|---|---|---|---|---|
| 🔲 | GET | `/api/sheets/favorites` | Connecté | 8 |
| 🔲 | PUT | `/api/sheets/:sheetId/favorite` | Règle d'accès | 8 |
| 🔲 | DELETE | `/api/sheets/:sheetId/favorite` | Connecté | 8 |

- `PUT` ajoute la fiche à mes favoris (sans effet si elle y est déjà) → **204**.
- `DELETE` la retire → **204**.
- `GET` → `Paginated<SheetSummary>` des favoris encore visibles.
