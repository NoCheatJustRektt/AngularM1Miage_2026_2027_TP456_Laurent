# Rapport du projet StudyShare

> Rapport exigé par le sujet du TP4 : travail effectué, choix techniques, fonctionnalités implémentées et résultats des tests.
> Ce document est complété à la fin de chaque étape. Il résume les documents de `docs/` et renvoie vers eux pour le détail.

**Dernière mise à jour :** 2026-11-04 — fin de la phase de conception.

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
| 0. Mise en place | Structure du projet, outillage, premiers tests | 🔲 À faire |
| 1 à 8 | Voir [docs/ROADMAP.md](docs/ROADMAP.md) | 🔲 À faire |

_Le détail de chaque étape sera ajouté ici au fur et à mesure._

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

Détail et alternatives étudiées : [docs/DECISIONS.md](docs/DECISIONS.md).

## 5. Fonctionnalités implémentées

_Aucune pour l'instant. Ce tableau sera rempli au fil des étapes._

| Fonctionnalité | Étape | État |
|---|---|---|
| — | — | — |

## 6. Résultats des tests

_Aucun test pour l'instant. Voir [docs/TESTS.md](docs/TESTS.md) pour la stratégie._

| Date | Suite | Tests | Réussis | Échoués | Couverture |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

## 7. Utilisation de l'IA

_À compléter : bilan de l'utilisation de Claude Code (ce qui a bien fonctionné, ce qui a dû être corrigé, part du travail)._

## 8. Difficultés rencontrées

_À compléter._

## 9. Perspectives

_À compléter : fonctionnalités bonus non réalisées, améliorations possibles._
