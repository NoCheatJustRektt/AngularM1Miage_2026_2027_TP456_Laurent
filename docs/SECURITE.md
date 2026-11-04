# Sécurité

> Mesures de sécurité prévues pour StudyShare et leur état.
> État : 🔲 prévue · ✅ en place et testée

## 1. Comptes et mots de passe

| Mesure | Détail | État |
|---|---|---|
| Mots de passe chiffrés | Hash **bcrypt** (coût 12). Le mot de passe en clair n'est jamais stocké ni journalisé | 🔲 |
| Champ protégé | `passwordHash` a `select: false` dans Mongoose et n'est jamais renvoyé (mappers) | 🔲 |
| Règles de mot de passe | 8 caractères minimum, au moins une lettre et un chiffre | 🔲 |
| Message de connexion neutre | « E-mail ou mot de passe incorrect » : on ne révèle pas si l'e-mail existe | 🔲 |
| Limitation des tentatives | `express-rate-limit` : 10 connexions par 15 minutes et 10 inscriptions par heure, par adresse IP | 🔲 |

## 2. Jeton d'authentification (JWT)

| Mesure | Détail | État |
|---|---|---|
| Signature | HS256 avec `JWT_SECRET` (64 caractères aléatoires au minimum, différent par environnement) | 🔲 |
| Durée de vie | 7 jours. Contenu limité à `sub` (id utilisateur) et `role` | 🔲 |
| Vérification | `requireAuth` vérifie la signature et l'expiration, puis recharge l'utilisateur (un compte supprimé perd l'accès) | 🔲 |
| Stockage côté navigateur | `localStorage` (choix assumé, voir [DECISIONS.md](DECISIONS.md#adr-008--authentification-par-jwt-en-en-tête-bearer)). Contrepartie : se protéger contre le XSS (section 6) | 🔲 |
| Envoi limité | L'interceptor n'ajoute le jeton **qu'aux requêtes vers l'API**, jamais vers Supabase ou un autre site | 🔲 |
| Déconnexion | Le jeton est effacé du navigateur ; une réponse 401 déconnecte automatiquement | 🔲 |

## 3. Droits d'accès

| Mesure | Détail | État |
|---|---|---|
| Règle centralisée | Toute lecture de fiche passe par `sheet.policy.ts` (`canViewSheet`, `buildVisibleSheetsFilter`) | 🔲 |
| Pas de fuite d'existence | Une fiche non visible renvoie **404**, pas 403 | 🔲 |
| Propriétaire uniquement | Modifier, changer l'état, partager, supprimer : vérifié côté serveur, jamais seulement en masquant un bouton | 🔲 |
| Rôle modérateur | `requireRole('moderator')` sur `/api/moderation/*` ; le rôle ne peut pas être changé par l'API | 🔲 |
| Partage limité | Partage seulement avec un ami ou un groupe dont on est membre | 🔲 |
| Tests dédiés | Chaque cas de la règle d'accès a un test, y compris les refus | 🔲 |

## 4. Fichiers

| Mesure | Détail | État |
|---|---|---|
| Types acceptés | PDF, PNG, JPG uniquement | 🔲 |
| Vérification du contenu réel | Bibliothèque `file-type` : on lit les premiers octets, on ne fait pas confiance à l'extension ni au type annoncé par le navigateur | 🔲 |
| Tailles | 20 Mo par fichier, 5 fichiers par fiche, 50 Mo par utilisateur | 🔲 |
| Nom de stockage | `users/{userId}/{uuid}.{ext}` : le nom d'origine n'est **jamais** utilisé comme chemin (pas de `../`, pas de collision) | 🔲 |
| Nom d'origine nettoyé | Caractères de contrôle et séparateurs retirés, 255 caractères maximum ; affiché comme texte, jamais comme HTML | 🔲 |
| Bucket privé | Aucun fichier n'est accessible sans URL signée | 🔲 |
| URL signée courte | Valable 5 minutes, générée après vérification de la règle d'accès. Arrêter un partage est donc effectif | 🔲 |
| Pas d'orphelins | Si l'enregistrement en base échoue, les fichiers envoyés sont supprimés | 🔲 |
| Téléchargement forcé | Les fichiers sont servis en téléchargement (`Content-Disposition: attachment`), pas exécutés dans le navigateur | 🔲 |

## 5. Secrets et configuration

| Mesure | Détail | État |
|---|---|---|
| Fichier `.env` | Jamais committé (`.gitignore`). Le dépôt contient seulement `server/.env.example`, sans valeur secrète | ✅ |
| Validation au démarrage | `config/env.ts` refuse de démarrer si une variable manque ou est invalide ; en production, `MONGODB_URI` et `CORS_ORIGIN` sont obligatoires (`JWT_SECRET` : étape 1) | ✅ |
| Clé Supabase `service_role` | Donne tous les droits sur le stockage : **uniquement côté serveur**, dans les variables Render. Jamais dans Angular, jamais dans Git | 🔲 |
| MongoDB Atlas | Utilisateur dédié avec droits limités à la base du projet ; mot de passe long et aléatoire. Render n'ayant pas d'IP fixe, l'accès réseau est ouvert (`0.0.0.0/0`) : la sécurité repose sur ces identifiants | 🔲 |
| Journaux | Ne contiennent ni mot de passe, ni jeton, ni clé, ni URL signée | 🔲 |

## 6. Protection de l'application web

| Mesure | Détail | État |
|---|---|---|
| En-têtes HTTP | `helmet` sur l'API (testé dans `app.spec.ts`) | ✅ |
| CORS | Seule l'adresse du front (`CORS_ORIGIN`) est autorisée (testé dans `app.spec.ts`) | ✅ |
| XSS | Angular échappe automatiquement le contenu affiché ; `innerHTML` et `bypassSecurityTrust*` interdits avec du contenu utilisateur | 🔲 |
| Injection MongoDB | Toutes les entrées passent par Zod (middleware `validate` en place) ; option `sanitizeFilter` de Mongoose activée dans `core/db.ts` ; les paramètres de recherche ne sont jamais insérés tels quels dans une requête | 🔄 |
| Taille des requêtes | `express.json({ limit: '100kb' })` (413 au-delà) ; Multer limitera les fichiers à l'étape 2 | 🔄 |
| Erreurs | Les erreurs inattendues renvoient `INTERNAL_ERROR` sans pile d'appels ni détail technique (testé) | ✅ |
| HTTPS | Fourni par Render pour le front et l'API | 🔲 |

## 7. Dépendances

- `npm audit` lancé à chaque étape ; les failles « high » et « critical » sont corrigées avant de déployer.
- Audit du 2026-11-04 (étape 0) : aucune faille « high » ou « critical ». 15 alertes « moderate », toutes dues à `minimatch` (risque de déni de service), utilisé uniquement par ESLint et typescript-eslint : outils de développement, absents du serveur en production. À revoir quand ESLint publiera une mise à jour (la correction proposée par `npm audit fix --force` casserait ESLint).
- npm 11 ne lance plus automatiquement les scripts d'installation des dépendances (`allowScripts`) : c'est une protection contre les paquets malveillants. Aucun script n'est nécessaire au projet pour l'instant (le binaire MongoDB des tests est téléchargé au premier lancement).
- Versions verrouillées par `package-lock.json`.

## 8. Limites connues (projet d'école)

- Pas de vérification de l'adresse e-mail ni de réinitialisation du mot de passe.
- Pas de révocation des jetons avant leur expiration (hors suppression du compte).
- Pas d'antivirus sur les fichiers envoyés : la vérification du type réel et le téléchargement forcé limitent le risque.
