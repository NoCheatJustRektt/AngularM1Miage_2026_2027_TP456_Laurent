# Déploiement

> Guide pas à pas pour mettre StudyShare en ligne gratuitement : **Render** (front + API), **MongoDB Atlas** (données), **Supabase Storage** (fichiers).
> ⚠️ Ce guide sera vérifié et complété à l'étape 8. Les offres gratuites évoluent : vérifier les limites sur le site de chaque service.

## Vue d'ensemble

| Service | Rôle | Offre | Point d'attention |
|---|---|---|---|
| Render — Static Site | Application Angular | Gratuite | — |
| Render — Web Service | API Express | Gratuite | Veille après environ 15 min sans requête, puis 30 à 60 s au réveil |
| MongoDB Atlas | Base de données | M0 (~512 Mo) | Accès réseau ouvert (`0.0.0.0/0`) car Render n'a pas d'IP fixe |
| Supabase | Stockage des fichiers | Gratuite (~1 Go) | Projet mis en pause après environ une semaine d'inactivité |

## Variables d'environnement de l'API

| Variable | Exemple | Description |
|---|---|---|
| `NODE_ENV` | `production` | |
| `PORT` | `3000` | Fourni par Render |
| `MONGODB_URI` | `mongodb+srv://…/studyshare` | Chaîne de connexion Atlas |
| `JWT_SECRET` | 64 caractères aléatoires | Différent du développement |
| `JWT_EXPIRES_IN` | `7d` | |
| `CORS_ORIGIN` | `https://studyshare.onrender.com` | Adresse exacte du site Angular |
| `STORAGE_DRIVER` | `supabase` | `memory` en développement ou en test |
| `SUPABASE_URL` | `https://xxxx.supabase.co` | |
| `SUPABASE_SERVICE_ROLE_KEY` | `…` | **Secret.** Uniquement dans Render |
| `SUPABASE_BUCKET` | `studyshare-files` | |
| `MAX_FILE_SIZE_MB` | `20` | |
| `USER_QUOTA_MB` | `50` | |
| `SIGNED_URL_TTL_SECONDS` | `300` | Durée de validité des liens de téléchargement |

Le modèle sans valeurs secrètes est `server/.env.example`.

## 1. MongoDB Atlas

1. Créer un compte sur MongoDB Atlas, puis un **cluster M0** (gratuit), région Europe.
2. **Database Access** : créer un utilisateur dédié (par exemple `studyshare-app`) avec un mot de passe long généré, et le rôle *readWrite* sur la base `studyshare`.
3. **Network Access** : ajouter `0.0.0.0/0` (nécessaire pour Render).
4. **Connect → Drivers** : copier la chaîne `mongodb+srv://…`, y mettre le mot de passe et le nom de base `studyshare`. C'est `MONGODB_URI`.
5. Pour le développement, utiliser une autre base dans le même cluster : `studyshare-dev`.

## 2. Supabase Storage

1. Créer un compte et un projet Supabase (région Europe).
2. **Storage → New bucket** : nom `studyshare-files`, **Public : désactivé**.
3. Dans les réglages du bucket : taille maximale de fichier 20 Mo ; types autorisés `application/pdf`, `image/png`, `image/jpeg`.
4. **Project Settings → API** : copier l'**URL du projet** (`SUPABASE_URL`) et la clé **`service_role`** (`SUPABASE_SERVICE_ROLE_KEY`).
5. Ne jamais mettre cette clé dans le code, dans Angular ou dans Git.

## 3. Render

### API (Web Service)

1. Créer un compte Render et le relier au dépôt GitHub.
2. **New → Web Service**, offre gratuite.
3. Commande de build : `npm ci && npm run build -w shared && npm run build -w server`
4. Commande de démarrage : `npm run start -w server`
5. **Health Check Path** : `/api/health`
6. Ajouter toutes les variables d'environnement ci-dessus.

### Front (Static Site)

1. **New → Static Site**, même dépôt.
2. Commande de build : `npm ci && npm run build -w shared && npm run build -w client`
3. Dossier publié : `client/dist/client/browser`
4. **Redirects/Rewrites** : source `/*`, destination `/index.html`, action *Rewrite* (pour que les adresses Angular comme `/sheets/123` fonctionnent au rechargement).
5. L'adresse de l'API est fixée dans `client/src/environments/environment.ts` (`apiUrl`).

### Fichier `render.yaml`

À l'étape 8, ces réglages seront écrits dans `render.yaml` (Blueprint Render), pour recréer les deux services en un clic.

## 4. Vérifications après déploiement

- [ ] `GET https://<api>/api/health` répond `{ "status": "ok" }`
- [ ] `GET https://<api>/api/health?deep=1` répond `database: ok` et `storage: ok`
- [ ] Le site s'affiche, l'inscription et la connexion fonctionnent
- [ ] Un fichier envoyé apparaît dans le bucket Supabase, sous `users/<id>/`
- [ ] Le téléchargement fonctionne ; le lien ne marche plus après 5 minutes
- [ ] Une fiche privée n'est pas visible depuis un autre compte
- [ ] Recharger une page interne (`/my-sheets`) ne donne pas d'erreur 404
- [ ] Aucune erreur CORS dans la console du navigateur

## 5. Avant une démo

1. Ouvrir le site **une ou deux minutes avant** : la première requête réveille l'API.
2. Vérifier que le projet Supabase n'est pas en pause (tableau de bord Supabase), ou lancer `/api/health?deep=1`.
3. Préparer deux ou trois comptes de démonstration (dont un modérateur) avec des fiches, des amis et un groupe.

## 6. Garder les services éveillés (optionnel)

Une tâche GitHub Actions planifiée pourra appeler `/api/health?deep=1` régulièrement, ce qui sollicite MongoDB et Supabase. À décider à l'étape 8, en vérifiant que c'est conforme aux conditions d'utilisation des services.
