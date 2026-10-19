import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getPrisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations";

function rateKey(request: Request) { const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"; return createHash("sha256").update(forwarded).digest("hex").slice(0, 32); }

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && process.env.NEXTAUTH_URL && !origin.startsWith(process.env.NEXTAUTH_URL)) return NextResponse.json({ message: "Origine de requête non autorisée." }, { status: 403 });
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Vérifiez les champs du formulaire." }, { status: 400 });
    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ message: "Le formulaire est prêt, mais la base de données du club n’est pas encore configurée." }, { status: 503 });
    const key = rateKey(request);
    const now = new Date();
    const windowMs = 60 * 60 * 1000;
    const bucket = await prisma.rateLimitBucket.findUnique({ where: { key } });
    if (bucket && now.getTime() - bucket.windowStart.getTime() < windowMs && bucket.count >= 5) return NextResponse.json({ message: "Trop de messages envoyés récemment. Réessayez plus tard." }, { status: 429 });
    if (!bucket || now.getTime() - bucket.windowStart.getTime() >= windowMs) await prisma.rateLimitBucket.upsert({ where: { key }, update: { windowStart: now, count: 1 }, create: { key, windowStart: now, count: 1 } });
    else await prisma.rateLimitBucket.update({ where: { key }, data: { count: { increment: 1 } } });
    await prisma.contactMessage.create({ data: { name: parsed.data.name, email: parsed.data.email, subject: parsed.data.subject, message: parsed.data.message, ipHash: key } });
    return NextResponse.json({ message: "Votre message a bien été enregistré. Le club pourra vous répondre depuis son espace de gestion." });
  } catch {
    return NextResponse.json({ message: "Le message n’a pas pu être enregistré pour le moment." }, { status: 500 });
  }
}
