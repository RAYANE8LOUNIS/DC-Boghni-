import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/admin/login");
  return session;
}

export async function getApiSession() {
  return getServerSession(authOptions);
}

export function isAdminRole(role?: string) {
  return role === "ADMIN";
}
