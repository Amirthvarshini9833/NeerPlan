import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({ quoteCount: z.union([z.literal(2), z.literal(3)]) });

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req: request as never });
  if (!token?.sub) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id } = await params;
  const assessment = await prisma.assessment.findFirst({ where: { id, userId: token.sub }, include: { leads: { include: { quotes: { orderBy: { priceInr: "asc" } } } } } });
  if (!assessment) return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
  return NextResponse.json({ requested: assessment.quoteCountRequested, status: assessment.quoteRequestStatus, quotes: assessment.leads.flatMap((lead) => lead.quotes) });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req: request as never });
  if (!token?.sub) return NextResponse.json({ error: "Sign in to request quotes." }, { status: 401 });
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Choose 2 or 3 quotes." }, { status: 400 });
  const { id } = await params;
  const assessment = await prisma.assessment.findFirst({ where: { id, userId: token.sub }, select: { id: true } });
  if (!assessment) return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
  const updated = await prisma.assessment.update({ where: { id }, data: { quoteCountRequested: parsed.data.quoteCount, quoteRequestStatus: "REQUESTED" } });
  return NextResponse.json({ requested: updated.quoteCountRequested, status: updated.quoteRequestStatus });
}
