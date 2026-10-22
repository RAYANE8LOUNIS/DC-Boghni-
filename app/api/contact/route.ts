import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getPrisma } from "@/lib/prisma";
import { consumeRateLimit, RateLimitExceeded } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validations";

function rateKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(forwarded).digest("hex").slice(0, 32);
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    const allowedOrigins = new Set([new URL(request.url).origin]);
    if (process.env.NEXTAUTH_URL) {
      try {
        allowedOrigins.add(new URL(process.env.NEXTAUTH_URL).origin);
      } catch {
        // Ignore malformed optional configuration and keep the request origin allowlist.
      }
    }
    if (origin && !allowedOrigins.has(origin)) return NextResponse.json({ message: "Origine de requête non autorisée." }, { status: 403 });

    const declaredLength = Number(request.headers.get("content-length") || 0);
    if (declaredLength > 20_000) return NextResponse.json({ message: "Le message est trop volumineux." }, { status: 413 });
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 20_000) return NextResponse.json({ message: "Le message est trop volumineux." }, { status: 413 });
    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ message: "Données invalides." }, { status: 400 });
    }
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Vérifiez les champs du formulaire." }, { status: 400 });
    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ message: "Le formulaire est prêt, mais la base de données du club n’est pas encore configurée." }, { status: 503 });
    const ipHash = rateKey(request);
    const rateValue = `${ipHash}:${parsed.data.email.toLowerCase()}`;
    try {
      await consumeRateLimit(prisma, "contact", rateValue, 5, 60 * 60 * 1000);
    } catch (error) {
      if (error instanceof RateLimitExceeded) return NextResponse.json({ message: "Trop de messages envoyés récemment. Réessayez plus tard." }, { status: 429 });
      throw error;
    }
    await prisma.contactMessage.create({ data: { name: parsed.data.name, email: parsed.data.email, subject: parsed.data.subject, message: parsed.data.message, ipHash } });
    return NextResponse.json({ message: "Votre message a bien été enregistré. Le club pourra vous répondre depuis son espace de gestion." });
  } catch {
    return NextResponse.json({ message: "Le message n’a pas pu être enregistré pour le moment." }, { status: 500 });
  }
}
