import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
import { slugify } from "@/lib/format";
import { playerSchema, staffSchema } from "@/lib/validations";

async function sessionOr401() {
  const session = await getApiSession();
  return session?.user ? session : null;
}

export async function GET() {
  if (!(await sessionOr401())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ seasons: [], players: [], staff: [] });
  const [seasons, players, staff] = await Promise.all([
    prisma.season.findMany({ orderBy: [{ isCurrent: "desc" }, { name: "desc" }] }),
    prisma.player.findMany({ include: { season: true }, orderBy: [{ active: "desc" }, { position: "asc" }, { displayOrder: "asc" }, { name: "asc" }] }),
    prisma.staffMember.findMany({ include: { season: true }, orderBy: [{ active: "desc" }, { displayOrder: "asc" }, { name: "asc" }] })
  ]);
  return NextResponse.json({ seasons, players, staff });
}

export async function POST(request: Request) {
  if (!(await sessionOr401())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const body = await request.json() as { type?: "player" | "staff"; data?: unknown };
  if (!body.type || !body.data) return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  try {
    if (body.type === "player") {
      const parsed = playerSchema.safeParse(body.data);
      if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 });
      const data = parsed.data;
      const slugBase = slugify(data.name);
      const slug = `${slugBase}-${Date.now().toString().slice(-6)}`;
      const player = await prisma.player.create({ data: { name: data.name, slug, number: data.number ?? null, position: data.position, birthDate: data.birthDate ? new Date(`${data.birthDate}T12:00:00.000Z`) : null, bio: data.bio || null, imageUrl: data.imageUrl || null, imageAlt: data.imageAlt || null, active: data.active, displayOrder: data.displayOrder, seasonId: data.seasonId || null, isDemo: false }, include: { season: true } });
      return NextResponse.json({ item: player }, { status: 201 });
    }
    const parsed = staffSchema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 });
    const data = parsed.data;
    const staff = await prisma.staffMember.create({ data: { name: data.name, role: data.role, bio: data.bio || null, imageUrl: data.imageUrl || null, imageAlt: data.imageAlt || null, active: data.active, displayOrder: data.displayOrder, seasonId: data.seasonId || null, isDemo: false }, include: { season: true } });
    return NextResponse.json({ item: staff }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Impossible de créer cette fiche." }, { status: 409 });
  }
}

export async function PATCH(request: Request) {
  if (!(await sessionOr401())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const body = await request.json() as { type?: "player" | "staff"; id?: string; data?: unknown };
  if (!body.type || !body.id || !body.data) return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  try {
    if (body.type === "player") {
      const parsed = playerSchema.safeParse(body.data);
      if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 });
      const data = parsed.data;
      const player = await prisma.player.update({ where: { id: body.id }, data: { name: data.name, number: data.number ?? null, position: data.position, birthDate: data.birthDate ? new Date(`${data.birthDate}T12:00:00.000Z`) : null, bio: data.bio || null, imageUrl: data.imageUrl || null, imageAlt: data.imageAlt || null, active: data.active, displayOrder: data.displayOrder, seasonId: data.seasonId || null }, include: { season: true } });
      return NextResponse.json({ item: player });
    }
    const parsed = staffSchema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 });
    const data = parsed.data;
    const staff = await prisma.staffMember.update({ where: { id: body.id }, data: { name: data.name, role: data.role, bio: data.bio || null, imageUrl: data.imageUrl || null, imageAlt: data.imageAlt || null, active: data.active, displayOrder: data.displayOrder, seasonId: data.seasonId || null }, include: { season: true } });
    return NextResponse.json({ item: staff });
  } catch {
    return NextResponse.json({ message: "Impossible de modifier cette fiche." }, { status: 409 });
  }
}

export async function DELETE(request: Request) {
  if (!(await sessionOr401())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const body = await request.json() as { type?: "player" | "staff"; id?: string };
  if (!body.type || !body.id) return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  if (body.type === "player") await prisma.player.delete({ where: { id: body.id } });
  else await prisma.staffMember.delete({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
}
