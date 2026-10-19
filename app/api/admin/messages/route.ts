import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";

export async function GET() { const session = await getApiSession(); if (!session?.user) return NextResponse.json({ message: "Non autorisé." }, { status: 401 }); const prisma = getPrisma(); if (!prisma) return NextResponse.json({ messages: [] }); const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 80 }); return NextResponse.json({ messages }); }

export async function PATCH(request: Request) { const session = await getApiSession(); if (!session?.user) return NextResponse.json({ message: "Non autorisé." }, { status: 401 }); const prisma = getPrisma(); if (!prisma) return NextResponse.json({ message: "DATABASE_URL est manquante." }, { status: 503 }); const body = await request.json() as { id?: string; status?: "UNREAD" | "READ" | "ARCHIVED" }; if (!body.id || !body.status) return NextResponse.json({ message: "Données invalides." }, { status: 400 }); const message = await prisma.contactMessage.update({ where: { id: body.id }, data: { status: body.status, readAt: body.status === "READ" ? new Date() : undefined, archivedAt: body.status === "ARCHIVED" ? new Date() : undefined } }); return NextResponse.json({ message }); }
