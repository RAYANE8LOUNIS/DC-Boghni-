# DC Boghni — site du club

Site public et administration privée pour le DC Boghni, proposé bénévolement par Rayane Lounis, fondateur et CEO de RMWY Technologies.

La référence de navigation consultée est le site de la JS Kabylie : l’organisation en actualités, calendrier, classement, effectif et histoire a servi de point de départ, sans reprendre son code, son identité ou ses contenus. Le site est prêt pour la mise en production après configuration de la base et des services externes.

## Architecture

- Next.js App Router + TypeScript : pages publiques, métadonnées, sitemap et routes serveur.
- Tailwind CSS : tokens de base disponibles, avec une feuille CSS dédiée pour la direction artistique du club.
- PostgreSQL + Prisma : modèle relationnel pour contenus, saisons, compétitions, matchs, classement, effectif, partenaires, médias et messages.
- NextAuth avec identifiants : sessions JWT sécurisées, création des comptes uniquement par commande.
- Zod : validation serveur des articles, matchs et messages de contact.
- S3 compatible : helper d’URL d’upload prêt pour S3, R2 ou un fournisseur équivalent.

## Lancement local

Pré-requis : Node.js 20+, PostgreSQL 14+ et npm.

```bash
npm install
Copy-Item .env.example .env.local
npm run db:generate
npm run db:push
npm run db:seed
npm run db:create-admin -- admin@example.com "un-mot-de-passe-de-12-caracteres" "Nom de l'administrateur"
npm run dev
```

Ouvrir `http://localhost:3000`. L’administration est disponible à `http://localhost:3000/admin`.

Le seed est volontairement séparé. Il ajoute un jeu de données de démonstration isolé pour tester l’administration en local. En production, importez les données réelles du club ou n’exécutez pas le seed.

## Base de données et déploiement

1. Créer une base PostgreSQL sur Railway, puis renseigner `DATABASE_URL`.
2. Pour une première initialisation contrôlée : `npx prisma migrate dev --name init` en local, puis `npx prisma migrate deploy` en production.
3. Sur Vercel, renseigner `DATABASE_URL`, `NEXTAUTH_URL` et `NEXTAUTH_SECRET` dans les variables d’environnement.
4. Lancer `npm run build` avant la publication.

Le projet n’effectue aucun déploiement et ne crée aucune ressource externe automatiquement.

## Administration

- **Articles** : création, modification, brouillon, publication, catégorie et image.
- **Matchs** : saison, compétition, équipes, date/heure, stade, statut, score et compte rendu, avec modification et suppression protégées.
- **Référentiels** : saisons, compétitions et équipes adverses, avec une saison actuelle et l’identification du DC Boghni.
- **Effectif** : joueurs et staff, poste, numéro, saison, date de naissance, biographie, photo, ordre et visibilité.
- **Classement** : saisie complète par saison et compétition, points de base et ajustements séparés.
- **Le club** : chronologie historique et palmarès administrables.
- **Partenaires** : logos, liens, présentation, ordre et visibilité.
- **Médias** : téléversement direct vers un stockage S3/R2 configuré, validation du type, de la taille et du texte alternatif.
- **Messages** : lecture, marquage lu et archivage.
- **Paramètres** : identité, coordonnées, couleurs, direction et équipe fanion.

### Parcours recommandé pour saisir les données réelles

1. Ouvrir `/admin/referentiels` et créer la saison, la compétition et toutes les équipes du groupe.
2. Ouvrir `/admin/matchs` pour ajouter le calendrier, puis modifier le statut en **Terminé** et saisir le score après chaque rencontre.
3. Ouvrir `/admin/classement` et saisir la table complète, pas uniquement la ligne du DC Boghni.
4. Ouvrir `/admin/effectif` pour ajouter les joueurs et le staff de la saison active.
5. Ouvrir `/admin/medias` après avoir configuré S3/R2, puis réutiliser les URLs produites dans les fiches et les paramètres.
6. Compléter `/admin/club`, `/admin/partenaires` et `/admin/parametres` avec les informations et les visuels du club.

Les contenus sont enregistrés en PostgreSQL : une modification depuis l’administration est visible sur le site sans modifier le code ni relancer un déploiement. Les scores et classements restent manuels. Aucun flux de résultats en direct n’est simulé.

Les rôles sont `ADMIN` et `EDITOR`. Les éditeurs gèrent le contenu ; les opérations sensibles comme la suppression d’articles sont réservées à `ADMIN`. La protection existe côté middleware et côté serveur pour les routes API.

Les routes `/admin/*` redirigent vers la connexion lorsqu’aucune session n’est présente. Les mutations sensibles vérifient aussi le rôle côté serveur. Le stockage média nécessite un bucket S3/R2 avec une URL publique et une configuration CORS autorisant les `PUT` depuis le domaine du site.

## Sécurité appliquée

- Les pages privées et toutes les routes `/api/admin/*` sont protégées par session, puis la session est revalidée contre `AdminUser` en base à chaque requête sensible.
- Les mutations administratives vérifient l’origine, limitent la taille des requêtes et ne sont pas mises en cache. Les cookies de production sont sécurisés et les en-têtes de protection (CSP, anti-iframe, MIME, permissions, HSTS en production) sont activés.
- Les connexions échouées et le formulaire de contact utilisent une limitation persistante en PostgreSQL. Les données de formulaire et tous les contenus administrables passent par une validation Zod côté serveur.
- Les URLs externes acceptent uniquement `http`/`https`, les chemins média sont contrôlés, et les uploads S3/R2 sont limités à 8 Mo, à des types image connus et à la taille déclarée dans l’URL signée.
- Le rendu des articles utilise du texte React échappé : aucun HTML fourni par un administrateur n’est interprété comme du markup.
- `npm audit --omit=dev --audit-level=moderate` est propre après les overrides de PostCSS et `deepmerge-ts`. L’audit complet conserve des alertes de l’outillage Tailwind CSS 3, uniquement dans les dépendances de développement ; les supprimer entièrement demanderait une migration majeure vers Tailwind CSS 4.

En production, vérifiez que `NEXTAUTH_SECRET` est long, aléatoire et différent du local, que `NEXTAUTH_URL` correspond exactement à l’origine publique, et que les secrets Railway/S3/SMTP ne sont jamais ajoutés au dépôt. Les identifiants PostgreSQL précédemment exposés dans une conversation doivent être régénérés avant la mise en ligne.

## Contenus à demander au club

- Nom officiel, abréviation, slogan et couleurs officielles.
- Logo source et règles d’utilisation.
- Adresse postale, stade, email, téléphone, liens sociaux et lien Maps.
- Histoire vérifiée, dates clés, valeurs et palmarès.
- Calendrier, saisons, compétitions, résultats et classement complets.
- Photos autorisées : équipe, joueurs, staff, stade et événements, avec crédits et textes alternatifs.
- Effectif par saison : nom, numéro, poste, date de naissance facultative, biographie et autorisation d’image.
- Partenaires : nom, logo, URL, ordre et accord de publication.
- Mentions légales, responsable du traitement et politique de confidentialité.

## Services externes et coûts éventuels

- **Hébergement frontend** : Vercel ou équivalent. Les coûts dépendent de l’offre choisie ; aucun tarif n’est inventé ici.
- **PostgreSQL** : Railway ou équivalent. Le coût dépend du plan, de la consommation et de la région.
- **Stockage d’images** : S3, Cloudflare R2 ou équivalent, facturé selon stockage et bande passante.
- **Email** : un fournisseur SMTP ou transactionnel est facultatif pour les notifications du formulaire.
- **Domaine** : facultatif, acheté auprès d’un registrar choisi par le club.

## Vérifications réalisées et limites

Le code inclut les états vides, erreurs, chargement, page 404, navigation clavier, lien d’évitement, labels de formulaire, textes alternatifs, focus visibles, réduction des animations, sitemap et robots.txt. Les brouillons sont filtrés côté serveur sur les pages publiques. Les données de date sont affichées en `Africa/Algiers`.

À exécuter dans l’environnement configuré :

```bash
npm run typecheck
npm run build
```

Une base PostgreSQL est nécessaire pour vérifier les mutations admin, l’enregistrement des messages et le seed. Sans fournisseur SMTP, le formulaire enregistre le message en base mais n’envoie pas d’email ; le message affiché le précise. Les scores et classements restent manuels, sans résultats en direct.
