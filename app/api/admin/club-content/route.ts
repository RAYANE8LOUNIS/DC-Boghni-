import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
import { historyEventSchema, trophySchema } from "@/lib/validations";

async function sessionOr401() {
  const session = await getApiSession();
  return session?.user ? session : null;
}

export async function GET() {
  if (!(await sessionOr401())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ history: [], trophies: [] });
  const [history, trophies] = await Promise.all([
    prisma.historyEvent.findMany({ orderBy: [{ displayOrder: "asc" }, { yearLabel: "asc" }] }),
    prisma.trophy.findMany({ orderBy: [{ displayOrder: "asc" }, { yearLabel: "desc" }] })
  ]);
  return NextResponse.json({ history, trophies });
}

export async function POST(request: Request) {
  if (!(await sessionOr401())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const body = await request.json() as { type?: "history" | "trophy"; data?: unknown };
  if (!body.type || !body.data) return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  if (body.type === "history") {
    const parsed = historyEventSchema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 });
    return NextResponse.json({ item: await prisma.historyEvent.create({ data: { ...parsed.data, isDemo: false } }) }, { status: 201 });
  }
  const parsed = trophySchema.safeParse(body.data);
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 });
  return NextResponse.json({ item: await prisma.trophy.create({ data: { ...parsed.data, yearLabel: parsed.data.yearLabel || null, description: parsed.data.description || null, isDemo: false } }) }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await sessionOr401())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const body = await request.json() as { type?: "history" | "trophy"; id?: string; data?: unknown };
  if (!body.type || !body.id || !body.data) return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  if (body.type === "history") {
    const parsed = historyEventSchema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 });
    return NextResponse.json({ item: await prisma.historyEvent.update({ where: { id: body.id }, data: parsed.data }) });
  }
  const parsed = trophySchema.safeParse(body.data);
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 });
  return NextResponse.json({ item: await prisma.trophy.update({ where: { id: body.id }, data: { ...parsed.data, yearLabel: parsed.data.yearLabel || null, description: parsed.data.description || null } }) });
}

export async function DELETE(request: Request) {
  const session = await sessionOr401();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ message: "Réservé aux administrateurs." }, { status: 403 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const body = await request.json() as { type?: "history" | "trophy"; id?: string };
  if (!body.type || !body.id) return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  if (body.type === "history") await prisma.historyEvent.delete({ where: { id: body.id } });
  else await prisma.trophy.delete({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
}
