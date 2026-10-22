# Guide rapide de l’administration

## 1. Première connexion

1. Copier `.env.example` vers `.env.local` et renseigner PostgreSQL, `NEXTAUTH_URL` et un `NEXTAUTH_SECRET` long.
2. Exécuter `npm run db:push` ou déployer les migrations.
3. Créer le premier compte :

```bash
npm run db:create-admin -- admin@club.dz "un-mot-de-passe-de-12-caracteres" "Nom Prénom"
```

Il n’existe pas de formulaire d’inscription public.

## 2. Publier une actualité

Ouvrir **Articles**, renseigner le titre, la catégorie, le résumé et le contenu, puis choisir **Brouillon** pour travailler à plusieurs ou **Publié** pour rendre l’article visible. Les brouillons ne sont jamais récupérés par les pages publiques.

Pour remplacer une image, fournir une URL accessible par le serveur et un texte alternatif décrivant l’image. Le helper S3 de `lib/storage.ts` peut être branché à une interface d’upload lorsque le stockage est configuré.

## 3. Ajouter un match ou un résultat

Créer d’abord une saison, une compétition et les équipes dans **Référentiels**. Dans **Matchs**, choisir les deux équipes, la date, l’heure et le statut. Pour un résultat, choisir **Terminé** et saisir les deux scores. Les dates sont affichées selon `Africa/Algiers`. Un match existant peut être modifié ou supprimé selon les permissions.

Les statuts **Reporté** et **Annulé** sont conservés comme tels. Aucun résultat en direct n’est simulé.

## 4. Le club, la direction et la compétition

Dans **Paramètres**, compléter la présentation du Djurdjura Club Boghni, son surnom, le mot du président et les repères de l’équipe fanion. Les cartes **Direction & staff** sont alimentées par les membres du staff enregistrés dans PostgreSQL. La chronologie et le palmarès suivent les entités `HistoryEvent` et `Trophy`.

Le texte sportif et les résultats affichés sur le site sont ceux enregistrés dans l’administration. Pour publier un résultat, saisissez-le dans **Matchs** avec son statut **Terminé**.

## 5. Gérer l’effectif et le classement

Dans **Effectif**, choisir Joueur ou Staff, renseigner la saison, puis enregistrer la fiche. Une fiche peut être masquée temporairement sans être supprimée. La date de naissance sert au calcul automatique de l’âge sur le site public.

Dans **Classement**, sélectionner la saison et la compétition, puis enregistrer une ligne par équipe. Les colonnes sont saisies manuellement et l’ajustement de points est séparé des points de base. Après chaque modification, la date de mise à jour affichée au public provient de la dernière ligne modifiée.

## 6. Images et bibliothèque média

Dans **Médias**, sélectionner une image JPG, PNG, WebP ou AVIF de 8 Mo maximum et ajouter un texte alternatif. Le fichier est envoyé directement vers le bucket S3/R2 configuré, puis enregistré dans la base. Sur Vercel, ne stockez pas les images dans le dossier du projet : utilisez le stockage objet et vérifiez sa règle CORS.

Copiez ensuite l’URL de l’image dans les paramètres, les articles, les joueurs ou les partenaires. Une future évolution pourra proposer un sélecteur média directement dans chaque formulaire.

## 7. Messages reçus

Le formulaire de contact enregistre les messages dans la base. Dans **Messages**, marquer une demande comme lue après traitement, puis l’archiver lorsqu’elle n’a plus besoin d’apparaître dans la file active. L’envoi d’un email dépend de la configuration d’un fournisseur.

## 8. Avant la mise en ligne

- Remplacer ou supprimer les contenus `isDemo=true`.
- Importer le logo validé, les photos autorisées et leurs crédits.
- Renseigner les coordonnées, les réseaux sociaux, le stade, les saisons et les compétitions.
- Faire relire l’histoire, le palmarès, les biographies et les textes légaux.
- Vérifier une dernière fois les contenus, les images et les coordonnées avant la mise en production.
- Exécuter une sauvegarde PostgreSQL et vérifier la restauration sur un environnement séparé.

## 9. Règles de sécurité à conserver

- Ne partagez jamais `DATABASE_URL`, `NEXTAUTH_SECRET`, les clés S3/R2 ou le mot de passe d’un administrateur dans un ticket, un dépôt ou une capture d’écran.
- Utilisez un secret `NEXTAUTH_SECRET` différent pour chaque environnement et regénérez-le si une ancienne valeur a été exposée.
- Les comptes administrateurs sont créés uniquement avec la commande prévue ; il n’y a pas d’inscription publique.
- Les éditeurs peuvent gérer le contenu, mais les suppressions et les paramètres sensibles restent réservés à un administrateur.
- Si le domaine public, le bucket média ou les secrets changent, mettez à jour les variables Vercel/Railway et vérifiez à nouveau la connexion, le formulaire de contact et l’upload.
