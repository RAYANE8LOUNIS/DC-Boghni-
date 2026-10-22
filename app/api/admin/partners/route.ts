import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
import { slugify } from "@/lib/format";
import { partnerSchema } from "@/lib/validations";
import { revalidatePublicSite } from "@/lib/public-cache";

async function sessionOr401() {
  const session = await getApiSession();
  return session?.user ? session : null;
}

export async function GET() {
  if (!(await sessionOr401())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ partners: [] });
  return NextResponse.json({ partners: await prisma.partner.findMany({ orderBy: [{ displayOrder: "asc" }, { name: "asc" }] }) });
}

export async function POST(request: Request) {
  if (!(await sessionOr401())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const parsed = partnerSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 });
  const data = parsed.data;
  const slug = `${slugify(data.name)}-${Date.now().toString().slice(-6)}`;
  const partner = await prisma.partner.create({ data: { ...data, slug, logoUrl: data.logoUrl || null, websiteUrl: data.websiteUrl || null, description: data.description || null, isDemo: false } });
  revalidatePublicSite();
  return NextResponse.json({ partner }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await sessionOr401())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const body = await request.json() as { id?: string; data?: unknown };
  if (!body.id || !body.data) return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  const parsed = partnerSchema.safeParse(body.data);
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 });
  const data = parsed.data;
  const partner = await prisma.partner.update({ where: { id: body.id }, data: { ...data, logoUrl: data.logoUrl || null, websiteUrl: data.websiteUrl || null, description: data.description || null } });
  revalidatePublicSite();
  return NextResponse.json({ partner });
}

export async function DELETE(request: Request) {
  const session = await sessionOr401();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ message: "Réservé aux administrateurs." }, { status: 403 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const body = await request.json() as { id?: string };
  if (!body.id) return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  await prisma.partner.delete({ where: { id: body.id } });
  revalidatePublicSite();
  return NextResponse.json({ ok: true });
}
