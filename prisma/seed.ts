import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const season = await prisma.season.upsert({ where: { slug: "2026-2027-demo" }, update: {}, create: { name: "2026–2027", slug: "2026-2027-demo", isCurrent: true, isDemo: true } });
  const competition = await prisma.competition.upsert({ where: { slug: "regionale-2-groupe-b" }, update: {}, create: { name: "Régionale 2 · Groupe B", slug: "regionale-2-groupe-b", isDemo: true } });
  const club = await prisma.team.upsert({ where: { slug: "dc-boghni" }, update: { isClub: true }, create: { name: "DC Boghni", slug: "dc-boghni", isClub: true, logoUrl: "/images/logo-dcb.jpeg", isDemo: true } });
  const categoryNames = ["Vie du club", "Formation", "Matchday"];
  const categories = await Promise.all(categoryNames.map((name) => prisma.articleCategory.upsert({ where: { slug: name.toLowerCase().replace(/\s+/g, "-") }, update: {}, create: { name, slug: name.toLowerCase().replace(/\s+/g, "-") } })));

  const articles = [
    { title: "Le maillot comme point de départ", slug: "le-maillot-comme-point-de-depart", excerpt: "Les actualités, les rendez-vous et les histoires du DC Boghni.", content: "Les actualités et les rendez-vous qui donnent vie au maillot du DC Boghni.", imageUrl: "/images/jersey-dcb.jpeg", imageAlt: "Maillots du DC Boghni", categoryId: categories[0].id },
    { title: "Un espace pour la nouvelle génération", slug: "un-espace-pour-la-nouvelle-generation", excerpt: "La future rubrique jeunes du DC Boghni.", content: "Les actualités et les rendez-vous qui donnent vie au maillot du DC Boghni.", imageUrl: "/images/logo-dcb.jpeg", imageAlt: "Écusson du DC Boghni", categoryId: categories[1].id },
    { title: "Les jours de match se préparent ici", slug: "les-jours-de-match-se-preparent-ici", excerpt: "Calendrier et informations pratiques regroupés au même endroit.", content: "Les actualités et les rendez-vous qui donnent vie au maillot du DC Boghni.", imageUrl: "/images/jersey-dcb.jpeg", imageAlt: "Maillot du DC Boghni", categoryId: categories[2].id }
  ];
  for (const article of articles) {
    await prisma.article.upsert({ where: { slug: article.slug }, update: { ...article, status: "PUBLISHED", publishedAt: new Date(), isDemo: true }, create: { ...article, status: "PUBLISHED", publishedAt: new Date(), isDemo: true } });
  }

  for (const row of [
    { name: "Nom à renseigner", slug: "nom-a-renseigner-gardien", number: 1, position: "GOALKEEPER" as const },
    { name: "Nom à renseigner", slug: "nom-a-renseigner-defenseur", number: 4, position: "DEFENDER" as const },
    { name: "Nom à renseigner", slug: "nom-a-renseigner-milieu", number: 8, position: "MIDFIELDER" as const },
    { name: "Nom à renseigner", slug: "nom-a-renseigner-attaquant", number: 9, position: "FORWARD" as const }
  ]) {
    await prisma.player.upsert({ where: { slug: row.slug }, update: { ...row, seasonId: season.id, imageUrl: "/images/logo-dcb.jpeg", imageAlt: "Portrait du joueur du DC Boghni", bio: "Fiche joueur du DC Boghni.", isDemo: true }, create: { ...row, seasonId: season.id, imageUrl: "/images/logo-dcb.jpeg", imageAlt: "Portrait du joueur du DC Boghni", bio: "Fiche joueur du DC Boghni.", isDemo: true } });
  }

  for (const [position, name] of [[1, "Équipe à renseigner"], [2, "DC Boghni"], [3, "Équipe à renseigner"], [4, "Équipe à renseigner"]] as const) {
    const team = name === "DC Boghni" ? club : await prisma.team.upsert({ where: { slug: `equipe-demo-${position}` }, update: {}, create: { name, slug: `equipe-demo-${position}`, isDemo: true } });
    await prisma.standing.upsert({ where: { seasonId_competitionId_teamId: { seasonId: season.id, competitionId: competition.id, teamId: team.id } }, update: { position, isDemo: true }, create: { seasonId: season.id, competitionId: competition.id, teamId: team.id, position, isDemo: true } });
  }

  for (const [displayOrder, member] of [
    [0, { name: "Rachid Bourahla", role: "Président du CSA", bio: "Présidence du Club Sportif Amateur Djurdjura Club Boghni." }],
    [1, { name: "Staff technique", role: "Encadrement technique · équipe fanion", bio: "Préparation physique et tactique de l’équipe fanion pour le championnat de Régionale 2." }],
    [2, { name: "Bureau directeur & bénévoles", role: "Administration & logistique", bio: "Accompagnement des catégories de jeunes, relations avec les ligues et gestion quotidienne du club." }]
  ] as const) {
    await prisma.staffMember.upsert({ where: { id: `demo-staff-${displayOrder}` }, update: { ...member, displayOrder, isDemo: true }, create: { id: `demo-staff-${displayOrder}`, ...member, displayOrder, isDemo: true } });
  }

  for (const [displayOrder, event] of [
    [0, { yearLabel: "Racines", title: "Un club au pied du Djurdjura", description: "Ancré dans la ville de Boghni, le club porte les valeurs identitaires, culturelles et sportives de sa jeunesse. Le club porte les valeurs identitaires, culturelles et sportives de sa jeunesse." }],
    [1, { yearLabel: "Résilience", title: "La ferveur des Montagnards", description: "Joueurs, dirigeants et bénévoles ont fait vivre le DCB à travers les contraintes financières et les défis logistiques du football amateur en division régionale." }],
    [2, { yearLabel: "Transmission", title: "Former la relève locale", description: "Les catégories de jeunes, notamment les U15 et U17, participent à la transmission d’un ADN combatif et à l’éclosion de talents issus du territoire." }]
  ] as const) {
    await prisma.historyEvent.upsert({ where: { id: `demo-history-${displayOrder}` }, update: { ...event, displayOrder, isDemo: true }, create: { id: `demo-history-${displayOrder}`, ...event, displayOrder, isDemo: true } });
  }

  await prisma.clubSettings.upsert({ where: { id: "club" }, update: { clubName: "DC Boghni", shortName: "DCB", tagline: "Une ville. Un maillot. Une histoire à écrire.", description: "Le Djurdjura Club Boghni, plus communément appelé DC Boghni ou les Montagnards, porte une identité sportive et locale profondément ancrée à Boghni, au cœur de la Kabylie.", nickname: "Les Montagnards", presidentName: "Rachid Bourahla", presidentRole: "Président du CSA Djurdjura Club Boghni", presidentMessage: "Chers supporters, amis et partenaires du Djurdjura Club Boghni,\n\nC'est avec un immense honneur et un sens aigu des responsabilités que je m'adresse à vous en tant que Président du Club Sportif Amateur (CSA) du DCB.\n\nNotre club est bien plus qu'une simple équipe de football participant au championnat de Régionale 2 ; il est le porte-drapeau de toute une région, l'expression de la ferveur de notre formidable public et un espace d'éducation et d'épanouissement pour notre jeunesse. Malgré les contraintes financières et les défis du football amateur, notre bureau dirigeant, le staff technique et les joueurs se battent chaque jour avec rigueur, courage et amour du maillot pour hisser haut les couleurs de Boghni.\n\nJe tiens à remercier du fond du cœur nos supporters inconditionnels, qui bravent les déplacements et remplissent les travées pour nous pousser à la victoire. Ensemble, continuons à écrire l'histoire de notre cher club !\n\nAfud igarzen à tous, et vive le DCB !", currentCompetition: "Ligue Régionale de Football d'Alger (LRFA)", currentDivision: "Régionale 2 · Groupe B", sportingNote: "L'équipe fanion s'inscrit dans une dynamique compétitive, illustrée par le succès communiqué 3–1 face à l'ES Baghlia. ", address: "Boghni, Tizi-Ouzou, Algérie", email: "contact@dcboghni.dz", phone: "+213 000 00 00 00", logoUrl: "/images/logo-dcb.jpeg", heroImageUrl: "/images/jersey-dcb.jpeg", officialValidated: true, isDemo: true }, create: { id: "club", clubName: "DC Boghni", shortName: "DCB", tagline: "Une ville. Un maillot. Une histoire à écrire.", description: "Le Djurdjura Club Boghni, plus communément appelé DC Boghni ou les Montagnards, porte une identité sportive et locale profondément ancrée à Boghni, au cœur de la Kabylie.", nickname: "Les Montagnards", presidentName: "Rachid Bourahla", presidentRole: "Président du CSA Djurdjura Club Boghni", presidentMessage: "Chers supporters, amis et partenaires du Djurdjura Club Boghni,\n\nC'est avec un immense honneur et un sens aigu des responsabilités que je m'adresse à vous en tant que Président du Club Sportif Amateur (CSA) du DCB.\n\nNotre club est bien plus qu'une simple équipe de football participant au championnat de Régionale 2 ; il est le porte-drapeau de toute une région, l'expression de la ferveur de notre formidable public et un espace d'éducation et d'épanouissement pour notre jeunesse. Malgré les contraintes financières et les défis du football amateur, notre bureau dirigeant, le staff technique et les joueurs se battent chaque jour avec rigueur, courage et amour du maillot pour hisser haut les couleurs de Boghni.\n\nJe tiens à remercier du fond du cœur nos supporters inconditionnels, qui bravent les déplacements et remplissent les travées pour nous pousser à la victoire. Ensemble, continuons à écrire l'histoire de notre cher club !\n\nAfud igarzen à tous, et vive le DCB !", currentCompetition: "Ligue Régionale de Football d'Alger (LRFA)", currentDivision: "Régionale 2 · Groupe B", sportingNote: "L'équipe fanion s'inscrit dans une dynamique compétitive, illustrée par le succès communiqué 3–1 face à l'ES Baghlia. ", address: "Boghni, Tizi-Ouzou, Algérie", email: "contact@dcboghni.dz", phone: "+213 000 00 00 00", logoUrl: "/images/logo-dcb.jpeg", heroImageUrl: "/images/jersey-dcb.jpeg", officialValidated: true, isDemo: true } });
}

main().finally(() => prisma.$disconnect());


