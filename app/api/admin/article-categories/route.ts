import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
import { articleCategorySchema } from "@/lib/validations";
import { slugify } from "@/lib/format";

async function requireUser() {
  const session = await getApiSession();
  return session?.user ? session : null;
}

export async function GET() {
  if (!(await requireUser())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ categories: [] });
  const categories = await prisma.articleCategory.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: { name: "asc" }
  });
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  if (!(await requireUser())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const parsed = articleCategorySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 });
  try {
    const category = await prisma.articleCategory.create({ data: { name: parsed.data.name, slug: slugify(parsed.data.name) } });
    return NextResponse.json({ category }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Cette catégorie existe déjà ou son nom n’est pas disponible." }, { status: 409 });
  }
}

export async function PATCH(request: Request) {
  if (!(await requireUser())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const body = await request.json() as { id?: string; name?: unknown };
  if (!body.id) return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  const parsed = articleCategorySchema.safeParse({ name: body.name });
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 });
  try {
    const category = await prisma.articleCategory.update({ where: { id: body.id }, data: { name: parsed.data.name, slug: slugify(parsed.data.name) } });
    return NextResponse.json({ category });
  } catch {
    return NextResponse.json({ message: "Impossible de modifier cette catégorie. Vérifiez les doublons." }, { status: 409 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireUser();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ message: "Réservé aux administrateurs." }, { status: 403 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const body = await request.json() as { id?: string };
  if (!body.id) return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  await prisma.articleCategory.delete({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
}
