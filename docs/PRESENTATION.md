# Présentation de StudyShare

## En une phrase

**StudyShare est une plateforme web où les étudiants partagent leurs fiches de révision**, en public ou seulement avec leurs amis et leurs groupes de révision.

## Le problème

Pendant les révisions, les fiches circulent de façon désordonnée : photos envoyées sur les messageries, PDF perdus dans des conversations, dossiers partagés dont on ne sait plus qui y a accès. Résultat :

- il est difficile de **retrouver** une bonne fiche sur une matière ;
- on ne **maîtrise pas** qui peut voir ses documents, ni comment arrêter un partage ;
- les fiches de qualité ne profitent qu'à un petit cercle.

## La solution

StudyShare centralise les fiches dans un espace unique :

- chaque étudiant **dépose ses fiches** (PDF ou images) avec un titre, une matière, un niveau et des mots-clés ;
- il choisit leur **visibilité** : **publique** (visible par tous les inscrits) ou **privée** (visible seulement par ceux avec qui il la partage) ;
- il **partage** une fiche privée avec un ami ou un groupe de révision, et peut **arrêter ce partage** à tout moment ;
- tout le monde peut **rechercher** parmi les fiches auxquelles il a accès et voir les **fiches récemment ajoutées** ;
- un **fil d'activité** montre ce que publient ses amis ;
- des **modérateurs** traitent les fiches signalées par la communauté.

## À qui s'adresse StudyShare ?

| Profil | Besoin | Ce que StudyShare lui apporte |
|---|---|---|
| **L'étudiant qui révise** | Trouver rapidement de bonnes fiches sur une matière | Recherche par mots-clés, matière et niveau ; fiches récentes |
| **L'étudiant qui produit des fiches** | Partager son travail avec ses amis sans tout rendre public | Fiches privées, partage avec un ami ou un groupe, arrêt du partage |
| **Le groupe de révision** | Rassembler les fiches d'une équipe au même endroit | Groupes, fiches partagées avec le groupe |
| **Le modérateur** | Garder la plateforme propre (contenus inappropriés, plagiat, spam) | File des fiches signalées, décision de republier ou d'archiver |

## Les rôles

| Rôle | Peut faire |
|---|---|
| **Visiteur** (non connecté) | Seulement s'inscrire ou se connecter : tout le contenu est réservé aux inscrits |
| **Utilisateur** | Gérer ses fiches, ses amis, ses groupes et ses partages ; rechercher ; signaler une fiche |
| **Modérateur** | Tout ce que fait un utilisateur, plus traiter les signalements |

## Glossaire

| Terme | Définition |
|---|---|
| **Fiche** | Un document de révision : un titre, une description, une matière, un niveau, des mots-clés et 1 à 5 fichiers |
| **Fichier** | Un PDF ou une image (PNG, JPG) attaché à une fiche, 20 Mo au maximum |
| **Visibilité** | *Publique* : visible par tous les inscrits une fois publiée. *Privée* : visible seulement par le propriétaire et ceux avec qui elle est partagée |
| **État** | L'étape du cycle de vie d'une fiche : *brouillon*, *publiée*, *signalée* ou *archivée* (voir [MODELE_DONNEES.md](MODELE_DONNEES.md)) |
| **Ami** | Un utilisateur dont on a accepté l'invitation (ou qui a accepté la nôtre) |
| **Groupe de révision** | Un ensemble d'amis réunis par un utilisateur, avec qui on peut partager des fiches d'un coup |
| **Partage** | Le droit donné à un ami ou à un groupe de voir une fiche. Il peut être **arrêté** par le propriétaire |
| **Signalement** | Une alerte d'un utilisateur sur une fiche (contenu inapproprié, droits d'auteur, spam…) |
| **Quota** | L'espace de stockage maximum par utilisateur (50 Mo) |
| **Fil d'activité** | La liste des dernières actions de ses amis (fiches publiées, nouveaux amis, groupes) |

## Périmètre

### Inclus

- Comptes utilisateurs, connexion, profil
- Fiches avec fichiers, cycle de vie, visibilité publique ou privée
- Amis, groupes de révision, partage et arrêt du partage
- Fiches récentes, recherche avec filtres, pagination
- Fil d'activité des amis
- Signalement et modération
- Déploiement en ligne gratuit (Render, MongoDB Atlas, Supabase Storage)

### Bonus (si le temps le permet)

- Favoris et votes
- Aperçu des PDF dans la page
- Notifications
- Commentaires sur les fiches

### Hors périmètre

- Messagerie entre utilisateurs
- Application mobile
- Édition collaborative des fichiers en ligne
- Paiement ou vente de fiches

## Contexte académique

- **Formation :** M1 MIAGE, année 2026-2027
- **Module :** Technologies Web, TP4 à TP6 (« Début du projet »)
- **Consignes du sujet :** gérer des utilisateurs, des envois et téléchargements de fichiers, des fichiers publics et privés, le partage entre amis (avec arrêt du partage), une recherche et une section « récemment ajoutés » ; discuter la conception avec un assistant IA ; écrire des tests unitaires pour chaque nouvelle fonctionnalité ; rédiger un `REPORT.md`.
