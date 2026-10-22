import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export async function requireSession() {
  const session = await getApiSession();
  if (!session?.user) redirect("/admin/login");
  return session;
}

export async function getApiSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    const user = await prisma.adminUser.findUnique({ where: { id: session.user.id }, select: { id: true, email: true, name: true, role: true } });
    if (!user) return null;
    return { ...session, user: { ...session.user, id: user.id, email: user.email, name: user.name || user.email, role: user.role } };
  } catch {
    return null;
  }
}

export function isAdminRole(role?: string) {
  return role === "ADMIN";
}
