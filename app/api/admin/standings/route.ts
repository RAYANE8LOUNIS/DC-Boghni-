import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
import { standingSchema } from "@/lib/validations";

async function sessionOr401() {
  const session = await getApiSession();
  return session?.user ? session : null;
}

export async function GET() {
  if (!(await sessionOr401())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ seasons: [], competitions: [], teams: [], standings: [] });
  const [seasons, competitions, teams, standings] = await Promise.all([
    prisma.season.findMany({ orderBy: [{ isCurrent: "desc" }, { name: "desc" }] }),
    prisma.competition.findMany({ orderBy: { name: "asc" } }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.standing.findMany({ include: { season: true, competition: true, team: true }, orderBy: [{ position: "asc" }, { team: { name: "asc" } }] })
  ]);
  return NextResponse.json({ seasons, competitions, teams, standings });
}

export async function POST(request: Request) {
  if (!(await sessionOr401())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const parsed = standingSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 });
  const data = parsed.data;
  const standing = await prisma.standing.upsert({ where: { seasonId_competitionId_teamId: { seasonId: data.seasonId, competitionId: data.competitionId, teamId: data.teamId } }, update: { position: data.position, played: data.played, wins: data.wins, draws: data.draws, losses: data.losses, goalsFor: data.goalsFor, goalsAgainst: data.goalsAgainst, points: data.points, pointsAdjust: data.pointsAdjust, isDemo: false }, create: { ...data, isDemo: false }, include: { season: true, competition: true, team: true } });
  return NextResponse.json({ standing });
}

export async function DELETE(request: Request) {
  if (!(await sessionOr401())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const body = await request.json() as { id?: string };
  if (!body.id) return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  await prisma.standing.delete({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
}
