import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
import { slugify } from "@/lib/format";
import { referenceSchema } from "@/lib/validations";

async function authorized() {
  const session = await getApiSession();
  return session?.user ? session : null;
}

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ seasons: [], competitions: [], teams: [] });
  const [seasons, competitions, teams] = await Promise.all([
    prisma.season.findMany({ orderBy: [{ isCurrent: "desc" }, { name: "desc" }] }),
    prisma.competition.findMany({ orderBy: { name: "asc" } }),
    prisma.team.findMany({ orderBy: { name: "asc" } })
  ]);
  return NextResponse.json({ seasons, competitions, teams });
}

export async function POST(request: Request) {
  if (!(await authorized())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const parsed = referenceSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 });
  const data = parsed.data;
  const slug = slugify(data.slug || data.name);
  try {
    if (data.type === "season") {
      const season = await prisma.$transaction(async (tx) => {
        if (data.isCurrent) await tx.season.updateMany({ data: { isCurrent: false } });
        return tx.season.create({ data: { name: data.name, slug, isCurrent: data.isCurrent, isDemo: false } });
      });
      return NextResponse.json({ item: season }, { status: 201 });
    }
    if (data.type === "competition") {
      const competition = await prisma.competition.create({ data: { name: data.name, slug, isDemo: false } });
      return NextResponse.json({ item: competition }, { status: 201 });
    }
    const team = await prisma.team.create({ data: { name: data.name, slug, isClub: data.isClub, logoUrl: data.logoUrl || null, isDemo: false } });
    return NextResponse.json({ item: team }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Impossible de créer cet élément. Le nom ou le slug existe peut-être déjà." }, { status: 409 });
  }
}

export async function PATCH(request: Request) {
  if (!(await authorized())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const parsed = referenceSchema.safeParse(await request.json());
  if (!parsed.success || !parsed.data.id) return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  const data = parsed.data;
  const slug = slugify(data.slug || data.name);
  try {
    if (data.type === "season") {
      const season = await prisma.$transaction(async (tx) => {
        if (data.isCurrent) await tx.season.updateMany({ where: { id: { not: data.id } }, data: { isCurrent: false } });
        return tx.season.update({ where: { id: data.id }, data: { name: data.name, slug, isCurrent: data.isCurrent } });
      });
      return NextResponse.json({ item: season });
    }
    if (data.type === "competition") return NextResponse.json({ item: await prisma.competition.update({ where: { id: data.id }, data: { name: data.name, slug } }) });
    return NextResponse.json({ item: await prisma.team.update({ where: { id: data.id }, data: { name: data.name, slug, isClub: data.isClub, logoUrl: data.logoUrl || null } }) });
  } catch {
    return NextResponse.json({ message: "Impossible de modifier cet élément. Vérifiez les doublons ou les relations existantes." }, { status: 409 });
  }
}

export async function DELETE(request: Request) {
  const session = await authorized();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ message: "Réservé aux administrateurs." }, { status: 403 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const body = await request.json() as { type?: "season" | "competition" | "team"; id?: string };
  if (!body.type || !body.id) return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  try {
    if (body.type === "season") await prisma.season.delete({ where: { id: body.id } });
    else if (body.type === "competition") await prisma.competition.delete({ where: { id: body.id } });
    else await prisma.team.delete({ where: { id: body.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Cet élément est encore utilisé par des données existantes." }, { status: 409 });
  }
}
