import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
import { adminUserCreateSchema, adminUserUpdateSchema } from "@/lib/validations";

async function requireAdmin() {
  const session = await getApiSession();
  return session?.user?.role === "ADMIN" ? session : null;
}

function publicUser(user: { id: string; email: string; name: string | null; role: "ADMIN" | "EDITOR"; createdAt: Date; updatedAt: Date }) {
  return { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt };
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Réservé aux administrateurs." }, { status: 403 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ users: [] });
  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ users: users.map(publicUser) });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Réservé aux administrateurs." }, { status: 403 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const parsed = adminUserCreateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 });
  try {
    const user = await prisma.adminUser.create({
      data: { name: parsed.data.name, email: parsed.data.email.toLowerCase(), passwordHash: await hash(parsed.data.password, 12), role: parsed.data.role }
    });
    return NextResponse.json({ user: publicUser(user) }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Cet email est déjà utilisé." }, { status: 409 });
  }
}

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Réservé aux administrateurs." }, { status: 403 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const parsed = adminUserUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 });
  if (parsed.data.id === session.user.id && parsed.data.role !== "ADMIN") {
    return NextResponse.json({ message: "Vous ne pouvez pas retirer votre propre accès administrateur." }, { status: 400 });
  }
  try {
    const data: { name: string; email: string; role: "ADMIN" | "EDITOR"; passwordHash?: string } = {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      role: parsed.data.role
    };
    if (parsed.data.password) data.passwordHash = await hash(parsed.data.password, 12);
    const user = await prisma.adminUser.update({ where: { id: parsed.data.id }, data });
    return NextResponse.json({ user: publicUser(user) });
  } catch {
    return NextResponse.json({ message: "Impossible de modifier ce compte. Vérifiez l’email et les données saisies." }, { status: 409 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Réservé aux administrateurs." }, { status: 403 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const body = await request.json() as { id?: string };
  if (!body.id) return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  if (body.id === session.user.id) return NextResponse.json({ message: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 400 });
  const user = await prisma.adminUser.findUnique({ where: { id: body.id }, select: { role: true } });
  if (!user) return NextResponse.json({ message: "Compte introuvable." }, { status: 404 });
  if (user.role === "ADMIN" && await prisma.adminUser.count({ where: { role: "ADMIN" } }) <= 1) {
    return NextResponse.json({ message: "Conservez au moins un administrateur." }, { status: 400 });
  }
  await prisma.adminUser.delete({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
}
