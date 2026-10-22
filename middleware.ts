import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");

  if (pathname === "/admin/login") return NextResponse.next();

  if (!process.env.NEXTAUTH_SECRET) {
    if (isAdminApi) return NextResponse.json({ message: "Authentification non configurée." }, { status: 503 });
    if (isAdminPage) return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    if (isAdminApi) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
    if (isAdminPage) return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isAdminApi && ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const declaredLength = Number(request.headers.get("content-length") || 0);
    if (Number.isFinite(declaredLength) && declaredLength > 1_000_000) {
      return NextResponse.json({ message: "Données trop volumineuses." }, { status: 413 });
    }
    const origin = request.headers.get("origin");
    const allowedOrigins = new Set([request.nextUrl.origin]);
    if (process.env.NEXTAUTH_URL) {
      try {
        allowedOrigins.add(new URL(process.env.NEXTAUTH_URL).origin);
      } catch {
        // Invalid deployment configuration is handled by the application session check.
      }
    }
    if (origin && !allowedOrigins.has(origin)) {
      return NextResponse.json({ message: "Origine de requête non autorisée." }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"] };
