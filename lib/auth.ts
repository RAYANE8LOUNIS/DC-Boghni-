import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getPrisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Identifiants administrateur",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        const prisma = getPrisma();
        if (!prisma || !credentials?.email || !credentials.password) return null;
        const user = await prisma.adminUser.findUnique({ where: { email: credentials.email.toLowerCase() } });
        if (!user || !(await compare(credentials.password, user.passwordHash))) return null;
        return { id: user.id, email: user.email, name: user.name || user.email, role: user.role as "ADMIN" | "EDITOR" };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: "ADMIN" | "EDITOR" }).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || "";
        session.user.role = token.role as "ADMIN" | "EDITOR";
      }
      return session;
    }
  }
};
