import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
import { articleSchema } from "@/lib/validations";
import { slugify } from "@/lib/format";

export async function GET() { const session = await getApiSession(); if (!session?.user) return NextResponse.json({ message: "Non autorisé." }, { status: 401 }); const prisma = getPrisma(); if (!prisma) return NextResponse.json({ articles: [] }); const articles = await prisma.article.findMany({ include: { category: true }, orderBy: { updatedAt: "desc" } }); return NextResponse.json({ articles }); }

export async function POST(request: Request) {
  const session = await getApiSession(); if (!session?.user) return NextResponse.json({ message: "Non autorisé." }, { status: 401 }); const prisma = getPrisma(); if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 }); const parsed = articleSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 }); const categorySlug = slugify(parsed.data.category); const category = await prisma.articleCategory.upsert({ where: { slug: categorySlug }, update: { name: parsed.data.category }, create: { name: parsed.data.category, slug: categorySlug } }); let slug = slugify(parsed.data.title); const existing = await prisma.article.findUnique({ where: { slug } }); if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`; const article = await prisma.article.create({ data: { title: parsed.data.title, slug, excerpt: parsed.data.excerpt, content: parsed.data.content, imageUrl: parsed.data.imageUrl || null, imageAlt: parsed.data.imageAlt || null, status: parsed.data.status, publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null, categoryId: category.id, authorId: session.user.id, isDemo: false }, include: { category: true } }); return NextResponse.json({ article }, { status: 201 });
}
