# StudyShare

> Plateforme de partage de fiches de révision entre étudiants.
> Projet WEB — M1 MIAGE 2026-2027, Technologies Web (TP4 à TP6).

Les étudiants déposent leurs fiches (PDF, images), choisissent si elles sont **publiques** ou **privées**, les partagent avec leurs **amis** ou leurs **groupes de révision**, et retrouvent les fiches des autres grâce à la **recherche**.

**État du projet :** conception terminée, développement pas encore commencé (voir [docs/ROADMAP.md](docs/ROADMAP.md)).

## Technologies

| Couche | Choix |
|---|---|
| Front-end | Angular + Angular Material (TypeScript) |
| Back-end | Node.js + Express (TypeScript) |
| Base de données | MongoDB Atlas + Mongoose |
| Stockage des fichiers | Supabase Storage (bucket privé) |
| Hébergement | Render (site statique + service web) |
| Tests | Vitest, Supertest, mongodb-memory-server |

## Prérequis

- Node.js 22 ou plus récent (LTS) et npm
- Git

## Installation et lancement

> Les commandes ci-dessous seront disponibles à partir de l'étape 0.

```bash
npm install
```

```bash
npm run dev
```

```bash
npm test
```

| Commande | Effet |
|---|---|
| `npm run dev` | Lance l'API (port 3000) et Angular (port 4200) |
| `npm test` | Lance tous les tests (back, front, partagé) |
| `npm run lint` | Vérifie le style du code |
| `npm run build` | Compile le projet pour la production |

La configuration se fait dans `server/.env` (modèle : `server/.env.example`). En développement, aucun compte cloud n'est nécessaire : la base et le stockage peuvent tourner en mémoire.

## Branches

```
main ← develop ← feature/… | fix/… | enhancement/… | docs/… | chore/… | refactor/… | test/…
```

Tout le travail se fait sur une branche créée depuis `develop`. Chaque fusion dans `develop` est validée par l'auteur ; seul l'auteur fusionne dans `main`. Détail : [docs/CONVENTIONS.md](docs/CONVENTIONS.md#8-git).

## Site en ligne

_À venir (déploiement sur Render)._

## Documentation

| Document | Contenu |
|---|---|
| [REPORT.md](REPORT.md) | **Rapport du projet** (exigé par le sujet) |
| [docs/PRESENTATION.md](docs/PRESENTATION.md) | Ce qu'est StudyShare, à qui il s'adresse |
| [docs/FONCTIONNALITES.md](docs/FONCTIONNALITES.md) | Comment fonctionne chaque page, côté utilisateur |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture et arborescence complète |
| [docs/MODELE_DONNEES.md](docs/MODELE_DONNEES.md) | Collections MongoDB, cycle de vie d'une fiche, règle d'accès |
| [docs/APIs.md](docs/APIs.md) | Toutes les routes de l'API |
| [docs/CONVENTIONS.md](docs/CONVENTIONS.md) | Règles de code à respecter |
| [docs/SECURITE.md](docs/SECURITE.md) | Mesures de sécurité |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Journal des choix techniques |
| [docs/TESTS.md](docs/TESTS.md) | Stratégie et résultats des tests |
| [docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md) | Guide de déploiement |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Étapes du projet et avancement |
| [docs/RAPPORT_IA.md](docs/RAPPORT_IA.md) | Journal des prompts envoyés à l'assistant IA |
| [CLAUDE.md](CLAUDE.md) | Règles suivies par l'assistant IA (Claude Code) |

## Auteur

Laurent Dupuis — M1 MIAGE, 2026-2027.
