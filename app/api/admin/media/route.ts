import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
import { createUploadUrl, deleteStoredObject, publicStorageUrl } from "@/lib/storage";
import { mediaCompleteSchema, mediaPrepareSchema } from "@/lib/validations";

async function sessionOr401() {
  const session = await getApiSession();
  return session?.user ? session : null;
}

export async function GET() {
  if (!(await sessionOr401())) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ assets: [] });
  return NextResponse.json({ assets: await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 120 }) });
}

export async function POST(request: Request) {
  const session = await sessionOr401();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const body = await request.json() as unknown;
  if (typeof body === "object" && body !== null && "action" in body && body.action === "prepare") {
    const parsed = mediaPrepareSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Fichier invalide." }, { status: 400 });
    const extension = parsed.data.filename.split(".").pop()?.toLowerCase() || "jpg";
    const key = `media/${new Date().getUTCFullYear()}/${randomUUID()}.${extension}`;
    const uploadUrl = await createUploadUrl(key, parsed.data.mimeType);
    if (!uploadUrl) return NextResponse.json({ message: "Le stockage S3/R2 n’est pas configuré." }, { status: 503 });
    return NextResponse.json({ uploadUrl, storageKey: key, url: publicStorageUrl(key), filename: parsed.data.filename, mimeType: parsed.data.mimeType, sizeBytes: parsed.data.sizeBytes, altText: parsed.data.altText });
  }
  const parsed = mediaCompleteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 });
  const asset = await prisma.mediaAsset.create({ data: { filename: parsed.data.filename, storageKey: parsed.data.storageKey, url: parsed.data.url, altText: parsed.data.altText, mimeType: parsed.data.mimeType, sizeBytes: parsed.data.sizeBytes, createdById: session.user.id, isDemo: false } });
  return NextResponse.json({ asset }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await sessionOr401();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ message: "Réservé aux administrateurs." }, { status: 403 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 });
  const body = await request.json() as { id?: string };
  if (!body.id) return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  const asset = await prisma.mediaAsset.delete({ where: { id: body.id } });
  await deleteStoredObject(asset.storageKey).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
