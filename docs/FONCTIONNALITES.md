# Fonctionnalités de StudyShare

> Ce document répond, page par page, à la question : **« En tant qu'utilisateur, comment fonctionne cette page ? »**
>
> État de chaque page : 🔲 prévue · 🔄 en cours · ✅ disponible

## Sommaire

| Page | Adresse | Accès | État |
|---|---|---|---|
| [Inscription](#inscription) | `/register` | Visiteur | 🔲 |
| [Connexion](#connexion) | `/login` | Visiteur | 🔲 |
| [Structure commune](#structure-commune-à-toutes-les-pages) | — | Connecté | 🔄 barre du haut et menu (Accueil seul) |
| [Accueil](#accueil) | `/` | Connecté | 🔄 version de l'étape 0 |
| [Recherche](#recherche) | `/search` | Connecté | 🔲 |
| [Mes fiches](#mes-fiches) | `/my-sheets` | Connecté | 🔲 |
| [Créer ou modifier une fiche](#créer-ou-modifier-une-fiche) | `/sheets/new`, `/sheets/:id/edit` | Propriétaire | 🔲 |
| [Détail d'une fiche](#détail-dune-fiche) | `/sheets/:id` | Selon la règle d'accès | 🔲 |
| [Fenêtre de partage](#fenêtre-de-partage) | (dans le détail) | Propriétaire | 🔲 |
| [Amis](#amis) | `/friends` | Connecté | 🔲 |
| [Groupes](#groupes) | `/groups`, `/groups/:id` | Membre | 🔲 |
| [Modération](#modération) | `/moderation` | Modérateur | 🔲 |
| [Profil](#profil) | `/profile` | Connecté | 🔲 |

---

## Inscription

**Objectif :** créer mon compte StudyShare.

**Ce que je vois :** un formulaire avec nom d'utilisateur, e-mail, mot de passe et confirmation, et un lien vers la connexion.

**Comment ça marche :**
1. Je remplis le formulaire. Les erreurs s'affichent sous chaque champ dès que je le quitte.
2. Je clique sur **Créer mon compte**.
3. Si tout est correct, je suis connecté automatiquement et j'arrive sur l'accueil.

**Règles :**
- Nom d'utilisateur : 3 à 30 caractères, lettres minuscules, chiffres, `.`, `_` ou `-`, unique.
- E-mail valide et unique.
- Mot de passe : au moins 8 caractères, avec au moins une lettre et un chiffre.

**Messages possibles :** « Ce nom d'utilisateur est déjà pris », « Un compte existe déjà avec cet e-mail », « Les mots de passe ne correspondent pas ».

## Connexion

**Objectif :** accéder à mon espace.

**Comment ça marche :**
1. Je saisis mon e-mail et mon mot de passe, puis je clique sur **Se connecter**.
2. J'arrive sur la page que je voulais ouvrir, ou sur l'accueil.
3. Je reste connecté jusqu'à ce que je me déconnecte ou que ma session expire (7 jours).

**Messages possibles :** « E-mail ou mot de passe incorrect » (volontairement sans préciser lequel des deux).

**Cas particulier :** si le serveur était en veille, un message « Réveil du serveur… » s'affiche pendant quelques secondes.

## Structure commune à toutes les pages

Une fois connecté, chaque page contient :

- **une barre en haut** : le logo, une barre de recherche rapide, un bouton **+ Nouvelle fiche** et mon avatar (menu : Profil, Déconnexion) ;
- **un menu latéral** : Accueil, Recherche, Mes fiches, Amis, Groupes, et Modération si je suis modérateur. Sur téléphone, il se replie derrière un bouton ☰ ;
- **des messages temporaires** en bas de l'écran pour confirmer une action (« Fiche publiée ») ou signaler une erreur.

Les fiches sont affichées sous forme de **cartes** : titre, matière, niveau, auteur, date, une pastille d'état (gris = brouillon, vert = publiée, orange = signalée, bleu = archivée) et un 🔒 si la fiche est privée.

## Accueil

**Objectif :** voir d'un coup d'œil ce qui est nouveau pour moi.

> **Disponible aujourd'hui (étape 0) :** un message de bienvenue et une carte **« État du serveur »**. Elle affiche « Connexion au serveur… » pendant la vérification, puis « Le serveur répond. » ou « Le serveur ne répond pas. » avec un bouton **Réessayer**. La page est accessible sans connexion tant que l'authentification (étape 1) n'existe pas. Sur téléphone, le menu se replie derrière le bouton ☰.

**Ce que je verrai, en trois sections :**
1. **Récemment ajoutées** : les dernières fiches publiques publiées sur la plateforme.
2. **Partagées avec moi** : les dernières fiches que mes amis ou mes groupes ont partagées avec moi.
3. **Activité de mes amis** : « Léa a publié *Fiche SQL — jointures* », « Tom et Inès sont maintenant amis », « Léa a ajouté Tom au groupe *BDD M1* ».

**Ce que je peux faire :** ouvrir une fiche, cliquer sur « Voir tout » pour aller à la recherche ou à la liste complète.

**Si c'est vide :** un message m'invite à créer ma première fiche ou à ajouter des amis.

## Recherche

**Objectif :** trouver une fiche parmi toutes celles auxquelles j'ai accès.

**Ce que je vois :** une barre de recherche, des filtres à gauche et les résultats en cartes (ou en liste, au choix).

**Comment ça marche :**
1. Je tape des mots-clés : ils sont cherchés dans le titre, les mots-clés et la description.
2. J'affine avec les filtres : **matière**, **niveau** (L1 à M2), **type de fichier** (PDF, image).
3. Je trie par **pertinence**, **date** ou **nombre de téléchargements**.
4. Les résultats sont paginés (20 par page). L'adresse de la page garde ma recherche : je peux la recharger ou la partager.

**Ce que la recherche montre :** les fiches publiées **publiques**, les fiches publiées **partagées avec moi**, et mes propres fiches publiées. Elle ne montre jamais les brouillons des autres, les fiches privées non partagées, ni les fiches signalées.

## Mes fiches

**Objectif :** gérer toutes mes fiches.

**Ce que je vois :** trois onglets, **Brouillons**, **Publiées** et **Archivées**, avec le nombre de fiches dans chacun, et l'espace de stockage utilisé (par exemple « 12 Mo sur 50 Mo »).

**Ce que je peux faire sur chaque fiche :**

| Action | Possible quand la fiche est… |
|---|---|
| Publier | brouillon |
| Repasser en brouillon (dépublier) | publiée |
| Archiver | publiée |
| Republier | archivée (sauf si un modérateur l'a archivée) |
| Modifier | brouillon, publiée ou archivée (pas signalée) |
| Supprimer définitivement | toujours, après confirmation |

Une fiche **signalée** apparaît dans l'onglet Publiées avec la pastille orange et le message « En cours de vérification par un modérateur » ; elle ne peut pas être modifiée en attendant.

## Créer ou modifier une fiche

**Objectif :** déposer une nouvelle fiche ou corriger une fiche existante.

**Ce que je vois :** un formulaire et une **zone de dépôt** de fichiers.

**Comment ça marche :**
1. Je remplis le **titre** (3 à 120 caractères), la **description** (facultative, 2 000 caractères au maximum), la **matière**, le **niveau** et jusqu'à **10 mots-clés**.
2. Je choisis la **visibilité** : publique ou privée.
3. Je **glisse mes fichiers** dans la zone, ou je clique pour les choisir. Chaque fichier affiche son nom, sa taille et une **barre de progression** pendant l'envoi. Je peux en retirer un avant d'enregistrer.
4. Je clique sur **Enregistrer en brouillon** ou sur **Publier**.

**Règles :**
- 1 à 5 fichiers par fiche, au format PDF, PNG ou JPG, 20 Mo au maximum chacun.
- Le **contenu réel** du fichier est vérifié : un fichier renommé en `.pdf` qui n'en est pas un est refusé.
- Le total de mes fichiers ne doit pas dépasser mon quota de 50 Mo.

**Messages possibles :** « Ce type de fichier n'est pas accepté », « Le fichier dépasse 20 Mo », « Espace de stockage insuffisant : il vous reste 4 Mo ».

## Détail d'une fiche

**Objectif :** consulter une fiche et ses fichiers.

**Ce que je vois :** le titre, l'auteur (lien vers son profil), la matière, le niveau, les mots-clés, la description, la date de publication, le nombre de téléchargements et la liste des fichiers avec un **aperçu** (vignette pour les images).

**Ce que je peux faire :**
- **Télécharger** un fichier : il s'ouvre sous son nom d'origine. Le lien de téléchargement n'est valable que quelques minutes : il ne sert à rien de le copier.
- **Signaler** la fiche si elle pose problème (pas sur mes propres fiches).
- **Si c'est ma fiche** : la modifier, changer son état, la supprimer et ouvrir la **fenêtre de partage**.

**Si je n'ai pas accès** (fiche privée non partagée avec moi, brouillon d'un autre, partage arrêté) : la page affiche « Fiche introuvable », exactement comme si elle n'existait pas.

## Fenêtre de partage

**Objectif :** choisir qui peut voir ma fiche, et retirer cet accès.

**Ce que je vois :** un champ de recherche « Ajouter un ami ou un groupe » et la liste des personnes et groupes qui ont déjà accès, chacun avec un bouton ✕.

**Comment ça marche :**
1. Je tape le nom d'un ami ou d'un groupe dont je fais partie, et je le sélectionne.
2. Il apparaît dans la liste : il voit maintenant la fiche (si elle est publiée) dans « Partagées avec moi ».
3. Pour arrêter le partage, je clique sur ✕ et je confirme. L'accès est retiré **immédiatement**, y compris aux liens de téléchargement déjà ouverts une fois qu'ils expirent (5 minutes au maximum).

**Règles :**
- Je ne peux partager qu'avec **mes amis** ou des **groupes dont je suis membre**.
- Si je retire un ami, tous mes partages directs avec lui sont arrêtés automatiquement.
- Une fiche publique est déjà visible par tous ; le partage sert alors seulement à la mettre en avant dans « Partagées avec moi ».

## Amis

**Objectif :** gérer mon réseau.

**Ce que je vois, en trois onglets :**
1. **Mes amis** : la liste, avec un bouton pour retirer un ami.
2. **Invitations reçues** : avec les boutons **Accepter** et **Refuser**.
3. **Invitations envoyées** : avec un bouton **Annuler**.

**Comment ajouter un ami :**
1. Je cherche un utilisateur par son nom (au moins 2 caractères).
2. Je clique sur **Inviter**. Il reçoit l'invitation dans son onglet « Invitations reçues ».
3. S'il m'avait déjà invité, nous devenons amis directement.

**Règles :** je ne peux pas m'inviter moi-même ni inviter quelqu'un deux fois.

## Groupes

**Objectif :** partager des fiches avec plusieurs amis d'un coup.

**Liste des groupes (`/groups`) :** les groupes dont je fais partie, avec un bouton **Créer un groupe** (nom et description).

**Détail d'un groupe (`/groups/:id`) :**
- les **membres** du groupe ;
- les **fiches partagées** avec le groupe ;
- si j'ai créé le groupe : ajouter un de mes amis, retirer un membre, modifier ou supprimer le groupe ;
- si je suis simple membre : **quitter le groupe**.

**Règles :**
- Seul le créateur du groupe peut ajouter des membres, et seulement parmi ses amis.
- Le créateur ne peut pas quitter son groupe : il peut le supprimer.
- Supprimer un groupe arrête tous les partages faits avec lui.

## Modération

**Accès :** réservé aux modérateurs. Le lien n'apparaît pas dans le menu pour les autres utilisateurs.

**Objectif :** traiter les fiches signalées.

**Comment ça marche :**
1. Un utilisateur qui a accès à une fiche peut la **signaler**, en choisissant un motif (contenu inapproprié, droits d'auteur, spam, autre) et en ajoutant un commentaire.
2. Quand une fiche reçoit **3 signalements**, elle passe à l'état **signalée** : elle disparaît de la recherche et des fiches récentes, et arrive dans la file de modération.
3. Le modérateur consulte la fiche et les motifs, puis décide :
   - **Republier** : les signalements sont rejetés et la fiche redevient visible ;
   - **Archiver** : la fiche est retirée et son propriétaire ne peut plus la republier.

## Profil

**Objectif :** gérer mes informations.

**Ce que je peux faire :** modifier ma filière, mon niveau et une courte présentation ; voir mon espace de stockage utilisé ; me déconnecter.

**Le profil d'un autre utilisateur** (`/users/:id`, depuis le nom d'un auteur) montre son nom, sa filière, son niveau, ses fiches publiques et un bouton **Inviter** si nous ne sommes pas encore amis.
