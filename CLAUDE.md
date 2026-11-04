# CLAUDE.md — Règles de travail sur StudyShare

Ce fichier est chargé au début de chaque session Claude Code. Ses règles s'appliquent à **chaque prompt**.

## Le projet en une phrase

**StudyShare** : plateforme de partage de fiches de révision entre étudiants (Angular + Express + MongoDB Atlas + Supabase Storage, déployée sur Render). Projet M1 MIAGE 2026-2027, Technologies Web, TP4 à TP6.

## Langue

- Répondre à l'utilisateur **en français**.
- **Code en anglais** : variables, fonctions, classes, fichiers, routes, messages de commit.
- **Français** pour la documentation, les commentaires et les textes affichés dans l'interface.

## Avant de coder

1. Lire les documents concernés par la demande : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/CONVENTIONS.md](docs/CONVENTIONS.md), [docs/MODELE_DONNEES.md](docs/MODELE_DONNEES.md), [docs/APIs.md](docs/APIs.md), [docs/ROADMAP.md](docs/ROADMAP.md).
2. Respecter **impérativement** [docs/CONVENTIONS.md](docs/CONVENTIONS.md) et la structure de [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
3. Toute décision technique nouvelle ou modifiée est validée avec l'utilisateur, puis ajoutée à [docs/DECISIONS.md](docs/DECISIONS.md).

## À chaque prompt : mettre à jour la documentation

À la fin de chaque réponse qui change quelque chose, mettre à jour **tous** les documents concernés :

| Si la réponse… | Mettre à jour |
|---|---|
| ajoute, modifie ou supprime une route d'API | `docs/APIs.md` (état ✅ / 🔲, conditions, erreurs) |
| crée, déplace ou supprime un fichier ou un dossier | `docs/ARCHITECTURE.md` (arborescence) |
| change une collection, un champ, un index, un état | `docs/MODELE_DONNEES.md` |
| ajoute ou change une page, une action utilisateur | `docs/FONCTIONNALITES.md` |
| ajoute une règle de code | `docs/CONVENTIONS.md` |
| prend une décision technique | `docs/DECISIONS.md` (nouvelle ADR) |
| touche à l'authentification, aux fichiers, aux droits, aux secrets | `docs/SECURITE.md` |
| ajoute ou modifie des tests, ou les lance | `docs/TESTS.md` (résultats datés) |
| change la configuration de déploiement ou les variables d'environnement | `docs/DEPLOIEMENT.md`, `server/.env.example` |
| fait avancer une étape | `docs/ROADMAP.md` |
| change le périmètre ou la vision du produit | `docs/PRESENTATION.md` |
| termine une étape | `REPORT.md` (travail effectué, choix, fonctionnalités, résultats des tests) |
| change l'installation ou les commandes | `README.md` |

Ne jamais laisser un document en contradiction avec le code.

## Journal des prompts : `docs/RAPPORT_IA.md`

- La journalisation est **active depuis l'étape 0** : le hook `.claude/hooks/log-prompt.mjs` ajoute automatiquement chaque prompt, horodaté (`"enabled": true` dans `.claude/hooks/prompt-log.config.json`).
- **À la fin de chaque réponse** : remplacer « À compléter par Claude » de la dernière entrée par le compte rendu détaillé, au format décrit en tête du fichier.
- Si une entrée manque (hook inactif, nouvelle session), l'ajouter à la main avec l'heure de `Get-Date -Format "yyyy-MM-dd HH:mm:ss"`.

## Lancer et vérifier

- `npm run dev` lance l'API (port 3000) et Angular (port 4200). Dans l'aperçu de Claude Code, lancer `npm run dev` en arrière-plan puis ouvrir la configuration `studyshare-dev` de `.claude/launch.json` : si l'aperçu lance lui-même la commande, il impose sa variable `PORT` et l'API prend le port 4200.
- Avant de dire qu'une étape est terminée : `npm run lint`, `npm test` et `npm run build` doivent passer, et l'écran concerné doit avoir été vérifié dans le navigateur.

## Qualité : définition de « terminé »

Une tâche n'est terminée que si :

- le code respecte les conventions et compile (`npm run build`, `npm run lint`) ;
- **chaque nouvelle fonctionnalité a ses tests unitaires**, et `npm test` passe ;
- la documentation est à jour (tableau ci-dessus) ;
- les résultats des tests sont reportés dans `docs/TESTS.md`.

Si un test échoue ou qu'une étape n'a pas pu être vérifiée, le dire clairement à l'utilisateur.

## Sécurité : à ne jamais faire

- Committer un secret (`.env`, clé Supabase `service_role`, `JWT_SECRET`, URI MongoDB).
- Utiliser la clé Supabase dans le client Angular : seul le serveur parle à Supabase.
- Exposer une fiche sans passer par `sheet.policy.ts` (règle d'accès centralisée).
- Utiliser le nom d'origine d'un fichier comme chemin de stockage.

## Git : workflow de branches (obligatoire)

```
main ← develop ← feature/… | fix/… | enhancement/… | docs/… | chore/… | refactor/… | test/…
```

- **Jamais de travail sur `main` ni sur `develop`.** Avant toute modification, se placer sur une branche de travail créée depuis `develop` à jour : `git switch -c <type>/<description> develop`. Si la demande continue une branche existante non fusionnée, rester sur cette branche.
- **Une branche = un sujet** (une étape, une correction, une amélioration). Nommage et types : `docs/CONVENTIONS.md`, section Git.
- Committer sur la branche de travail au fil de la tâche, en Conventional Commits, en anglais.
- **Quand la branche est terminée** (tests, lint et documentation à jour) : **demander la validation** de l'utilisateur avec un résumé et les résultats des tests. **Ne jamais fusionner sans son « oui » explicite** pour cette branche.
- Après validation : `git switch develop`, `git merge --no-ff <branche>`, puis `git branch -d <branche>`.
- **Ne jamais fusionner dans `main` ni pousser vers `main`** : c'est l'utilisateur qui le fait.
- Ne pousser vers GitHub que si l'utilisateur le demande.
- Le hook `.claude/hooks/guard-git.mjs` bloque les écarts : si une action est refusée, créer la bonne branche au lieu de contourner le garde-fou.
