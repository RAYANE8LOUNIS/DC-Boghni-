import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hashSync } from "bcryptjs";
import { getPrisma } from "@/lib/prisma";
import { consumeRateLimit, RateLimitExceeded, resetRateLimit } from "@/lib/rate-limit";

const DUMMY_PASSWORD_HASH = hashSync("invalid-password-placeholder", 12);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === "production",
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
        const email = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");
        if (!prisma || !email || !password) return null;
        try {
          await consumeRateLimit(prisma, "auth", email, 8, 15 * 60 * 1000);
        } catch (error) {
          if (error instanceof RateLimitExceeded) return null;
          return null;
        }
        const user = await prisma.adminUser.findUnique({ where: { email } });
        const passwordMatches = await compare(password, user?.passwordHash || DUMMY_PASSWORD_HASH);
        if (!user || !passwordMatches) return null;
        await resetRateLimit(prisma, "auth", email).catch(() => undefined);
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
