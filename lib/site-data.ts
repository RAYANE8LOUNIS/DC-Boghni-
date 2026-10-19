import { demoArticles, demoHistory, demoMatches, demoPlayers, demoSettings, demoStaff, demoStandings, demoTrophies } from "@/lib/demo-data";
import { getPrisma } from "@/lib/prisma";

export type PublicSettings = {
  clubName: string; shortName: string; tagline: string | null; description: string | null; nickname?: string | null; presidentName?: string | null; presidentRole?: string | null; presidentMessage?: string | null; currentCompetition?: string | null; currentDivision?: string | null; sportingNote?: string | null; address: string | null; email: string | null; phone: string | null; mapsUrl: string | null; instagramUrl: string | null; facebookUrl: string | null; youtubeUrl: string | null; logoUrl: string | null; heroImageUrl: string | null; primaryColor: string; accentColor: string; legalName: string | null; privacyText: string | null; officialValidated: boolean;
};
export type PublicArticle = { id: string; title: string; slug: string; excerpt: string | null; content: string; imageUrl: string | null; imageAlt: string | null; category: string; date: Date | string | null; publishedAt?: Date | null; status: string };
export type PublicPlayer = { id: string; name: string; slug: string; number: number | null; position: string; birthDate: Date | null; imageUrl: string | null; imageAlt: string | null; bio: string | null };
export type PublicStanding = { position: number; team: string; played: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number; points: number; pointsAdjust?: number; isClub: boolean };
export type FixtureOption = { name: string; slug?: string };
export type FixtureMatch = { id: string; kickoffAt: Date | string; venue: string | null; status: string; homeScore: number | null; awayScore: number | null; homeTeam: { name: string; logoUrl: string | null; isClub?: boolean }; awayTeam: { name: string; logoUrl: string | null; isClub?: boolean }; competition: { name: string }; season?: { name: string } };

function normalizeSettings(settings: Partial<PublicSettings> | null | undefined): PublicSettings { return { ...demoSettings, ...settings } as PublicSettings; }
function normalizeArticle(article: { id: string; title: string; slug: string; excerpt?: string | null; content: string; imageUrl?: string | null; imageAlt?: string | null; status?: string; publishedAt?: Date | null; createdAt?: Date; category?: { name: string } | string | null }): PublicArticle { const category = typeof article.category === "string" ? article.category : article.category?.name || "Actualité"; return { id: article.id, title: article.title, slug: article.slug, excerpt: article.excerpt || null, content: article.content, imageUrl: article.imageUrl || null, imageAlt: article.imageAlt || null, category, date: article.publishedAt || article.createdAt || null, publishedAt: article.publishedAt || null, status: article.status || "PUBLISHED" }; }
function normalizePlayer(player: { id: string; name: string; slug: string; number?: number | null; position: string; birthDate?: Date | null; imageUrl?: string | null; imageAlt?: string | null; bio?: string | null }): PublicPlayer { return { id: player.id, name: player.name, slug: player.slug, number: player.number ?? null, position: player.position, birthDate: player.birthDate || null, imageUrl: player.imageUrl || null, imageAlt: player.imageAlt || null, bio: player.bio || null }; }

export async function getSettings() {
  const prisma = getPrisma();
  if (!prisma) return normalizeSettings(demoSettings);
  try {
    const settings = await prisma.clubSettings.findUnique({ where: { id: "club" } });
    return normalizeSettings(settings);
  } catch {
    return normalizeSettings(demoSettings);
  }
}

export async function getHomeData() {
  const prisma = getPrisma();
  if (!prisma) return { settings: normalizeSettings(demoSettings), articles: demoArticles.map((article) => normalizeArticle(article)), upcoming: null, latestResult: null, standings: demoStandings as PublicStanding[], players: demoPlayers.map((player) => normalizePlayer({ ...player, position: player.position === "Gardien" ? "GOALKEEPER" : player.position === "Défenseur" ? "DEFENDER" : player.position === "Milieu" ? "MIDFIELDER" : "FORWARD" })) };
  try {
    const [settings, articles, upcoming, latestResult, standings, players] = await Promise.all([
      prisma.clubSettings.findUnique({ where: { id: "club" } }),
      prisma.article.findMany({ where: { status: "PUBLISHED" }, include: { category: true }, orderBy: { publishedAt: "desc" }, take: 3 }),
      prisma.match.findFirst({ where: { kickoffAt: { gte: new Date() }, status: "SCHEDULED" }, include: { homeTeam: true, awayTeam: true, competition: true }, orderBy: { kickoffAt: "asc" } }),
      prisma.match.findFirst({ where: { status: "COMPLETED" }, include: { homeTeam: true, awayTeam: true, competition: true }, orderBy: { kickoffAt: "desc" } }),
      prisma.standing.findMany({ include: { team: true }, orderBy: { position: "asc" }, take: 4 }),
      prisma.player.findMany({ where: { active: true }, orderBy: [{ position: "asc" }, { displayOrder: "asc" }], take: 4 })
    ]);
    return {
      settings: settings || demoSettings,
      articles: articles.length ? articles.map(normalizeArticle) : demoArticles.map((article) => normalizeArticle(article)),
      upcoming,
      latestResult,
      standings: standings.length ? standings.map((row) => ({ position: row.position, team: row.team.name, played: row.played, wins: row.wins, draws: row.draws, losses: row.losses, goalsFor: row.goalsFor, goalsAgainst: row.goalsAgainst, points: row.points, pointsAdjust: row.pointsAdjust, isClub: row.team.isClub })) : demoStandings as PublicStanding[],
      players: players.length ? players.map(normalizePlayer) : demoPlayers.map((player) => normalizePlayer({ ...player, position: player.position === "Gardien" ? "GOALKEEPER" : player.position === "Défenseur" ? "DEFENDER" : player.position === "Milieu" ? "MIDFIELDER" : "FORWARD" }))
    };
  } catch {
    return { settings: normalizeSettings(demoSettings), articles: demoArticles.map((article) => normalizeArticle(article)), upcoming: null, latestResult: null, standings: demoStandings as PublicStanding[], players: demoPlayers.map((player) => normalizePlayer({ ...player, position: "DEFENDER" })) };
  }
}

export async function getPublishedArticles(query?: { search?: string; category?: string }) {
  const prisma = getPrisma();
  if (!prisma) {
    const filtered = demoArticles.filter((article) => {
      const matchesSearch = !query?.search || article.title.toLowerCase().includes(query.search.toLowerCase());
      const matchesCategory = !query?.category || article.category === query.category;
      return matchesSearch && matchesCategory;
    });
    return { articles: filtered.map(normalizeArticle), categories: [...new Set(demoArticles.map((article) => article.category))] };
  }
  try {
    const [articles, categories] = await Promise.all([
      prisma.article.findMany({ where: { status: "PUBLISHED", ...(query?.search ? { title: { contains: query.search, mode: "insensitive" } } : {}), ...(query?.category ? { category: { slug: query.category } } : {}) }, include: { category: true }, orderBy: { publishedAt: "desc" } }),
      prisma.articleCategory.findMany({ orderBy: { name: "asc" } })
    ]);
    return { articles: articles.map(normalizeArticle), categories };
  } catch {
    return { articles: demoArticles.map(normalizeArticle), categories: [...new Set(demoArticles.map((article) => article.category))] };
  }
}

export async function getArticleBySlug(slug: string) {
  const prisma = getPrisma();
  if (!prisma) { const article = demoArticles.find((item) => item.slug === slug); return article ? normalizeArticle(article) : null; }
  try {
    const article = await prisma.article.findFirst({ where: { slug, status: "PUBLISHED" }, include: { category: true } }); return article ? normalizeArticle(article) : null;
  } catch {
    const article = demoArticles.find((item) => item.slug === slug); return article ? normalizeArticle(article) : null;
  }
}

export async function getFixtures() {
  const prisma = getPrisma();
  if (!prisma) return { seasons: [{ name: "Saison à renseigner", slug: "demo" }], competitions: [{ name: "Compétition à renseigner", slug: "demo" }], upcoming: [], results: [] };
  try {
    const [seasons, competitions, matches] = await Promise.all([
      prisma.season.findMany({ orderBy: [{ isCurrent: "desc" }, { name: "desc" }] }),
      prisma.competition.findMany({ orderBy: { name: "asc" } }),
      prisma.match.findMany({ include: { homeTeam: true, awayTeam: true, competition: true, season: true }, orderBy: { kickoffAt: "asc" } })
    ]);
    return { seasons, competitions, upcoming: matches.filter((match) => match.status === "SCHEDULED" || match.status === "POSTPONED" || match.status === "CANCELLED") as FixtureMatch[], results: matches.filter((match) => match.status === "COMPLETED") as FixtureMatch[] };
  } catch {
    return { seasons: [], competitions: [], upcoming: [], results: [] };
  }
}

export async function getStandings() {
  const prisma = getPrisma();
  if (!prisma) return { season: { name: "Saison à renseigner" }, competition: { name: "Compétition à renseigner" }, standings: demoStandings.map((row) => ({ ...row, pointsAdjust: 0 })), updatedAt: null };
  try {
    const currentSeason = await prisma.season.findFirst({ where: { isCurrent: true }, orderBy: { name: "desc" } });
    if (!currentSeason) return { season: null, competition: null, standings: [], updatedAt: null };
    const rows = await prisma.standing.findMany({ where: { seasonId: currentSeason.id }, include: { team: true, competition: true }, orderBy: { position: "asc" } });
    return { season: currentSeason, competition: rows[0]?.competition || null, standings: rows.map((row) => ({ position: row.position, team: row.team.name, played: row.played, wins: row.wins, draws: row.draws, losses: row.losses, goalsFor: row.goalsFor, goalsAgainst: row.goalsAgainst, points: row.points, pointsAdjust: row.pointsAdjust, isClub: row.team.isClub })), updatedAt: rows.reduce<Date | null>((latest, row) => !latest || row.updatedAt > latest ? row.updatedAt : latest, null) };
  } catch {
    return { season: { name: "Saison à renseigner" }, competition: { name: "Compétition à renseigner" }, standings: demoStandings.map((row) => ({ ...row, pointsAdjust: 0 })), updatedAt: null };
  }
}

export async function getSquad() {
  const prisma = getPrisma();
  if (!prisma) return { season: { name: "Saison à renseigner" }, players: demoPlayers.map((player) => normalizePlayer({ ...player, position: "DEFENDER" })), staff: [] };
  try {
    const season = await prisma.season.findFirst({ where: { isCurrent: true }, orderBy: { name: "desc" } });
    const [players, staff] = await Promise.all([
      prisma.player.findMany({ where: { active: true, ...(season ? { seasonId: season.id } : {}) }, orderBy: [{ position: "asc" }, { displayOrder: "asc" }] }),
      prisma.staffMember.findMany({ where: { active: true, ...(season ? { seasonId: season.id } : {}) }, orderBy: { displayOrder: "asc" } })
    ]);
    return { season, players: players.length ? players.map(normalizePlayer) : demoPlayers.map((player) => normalizePlayer({ ...player, position: "DEFENDER" })), staff };
  } catch {
    return { season: { name: "Saison à renseigner" }, players: demoPlayers.map((player) => normalizePlayer({ ...player, position: "DEFENDER" })), staff: [] };
  }
}

export async function getClubPageData() {
  const prisma = getPrisma();
  if (!prisma) return { settings: normalizeSettings(demoSettings), history: demoHistory, trophies: demoTrophies, staff: demoStaff };
  try {
    const [settings, history, trophies, staff] = await Promise.all([
      prisma.clubSettings.findUnique({ where: { id: "club" } }),
      prisma.historyEvent.findMany({ orderBy: [{ displayOrder: "asc" }, { yearLabel: "asc" }] }),
      prisma.trophy.findMany({ orderBy: [{ displayOrder: "asc" }, { yearLabel: "desc" }] }),
      prisma.staffMember.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" } })
    ]);
    return { settings: normalizeSettings(settings), history: history.length ? history : demoHistory, trophies: trophies.length ? trophies : demoTrophies, staff: staff.length ? staff : demoStaff };
  } catch {
    return { settings: normalizeSettings(demoSettings), history: demoHistory, trophies: demoTrophies, staff: demoStaff };
  }
}

export async function getPartners() {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    return await prisma.partner.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" } });
  } catch {
    return [];
  }
}
