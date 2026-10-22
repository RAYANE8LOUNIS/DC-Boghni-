import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
import { matchSchema } from "@/lib/validations";
import { revalidatePublicSite } from "@/lib/public-cache";

export async function GET() { const session = await getApiSession(); if (!session?.user) return NextResponse.json({ message: "Non autorisé." }, { status: 401 }); const prisma = getPrisma(); if (!prisma) return NextResponse.json({ seasons: [], competitions: [], teams: [], matches: [] }); const [seasons, competitions, teams, matches] = await Promise.all([prisma.season.findMany({ orderBy: { name: "desc" } }), prisma.competition.findMany({ orderBy: { name: "asc" } }), prisma.team.findMany({ orderBy: { name: "asc" } }), prisma.match.findMany({ include: { homeTeam: true, awayTeam: true, competition: true, season: true }, orderBy: { kickoffAt: "desc" } })]); return NextResponse.json({ seasons, competitions, teams, matches }); }

export async function POST(request: Request) { const session = await getApiSession(); if (!session?.user) return NextResponse.json({ message: "Non autorisé." }, { status: 401 }); const prisma = getPrisma(); if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 }); const parsed = matchSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 }); const match = await prisma.match.create({ data: { ...parsed.data, kickoffAt: new Date(parsed.data.kickoffAt), venue: parsed.data.venue || null, report: parsed.data.report || null, homeScore: parsed.data.homeScore ?? null, awayScore: parsed.data.awayScore ?? null }, include: { homeTeam: true, awayTeam: true, competition: true } }); revalidatePublicSite(); return NextResponse.json({ match }, { status: 201 }); }

export async function PATCH(request: Request) {
  const session = await getApiSession();
  if (!session?.user) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const body = await request.json() as { id?: string; data?: unknown };
  if (!body.id || !body.data) return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  const parsed = matchSchema.safeParse(body.data);
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 });
  const match = await prisma.match.update({ where: { id: body.id }, data: { ...parsed.data, kickoffAt: new Date(parsed.data.kickoffAt), venue: parsed.data.venue || null, report: parsed.data.report || null, homeScore: parsed.data.homeScore ?? null, awayScore: parsed.data.awayScore ?? null }, include: { homeTeam: true, awayTeam: true, competition: true } });
  revalidatePublicSite();
  return NextResponse.json({ match });
}

export async function DELETE(request: Request) {
  const session = await getApiSession();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ message: "Réservé aux administrateurs." }, { status: 403 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const body = await request.json() as { id?: string };
  if (!body.id) return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  await prisma.match.delete({ where: { id: body.id } });
  revalidatePublicSite();
  return NextResponse.json({ ok: true });
}
