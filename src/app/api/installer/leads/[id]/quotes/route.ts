import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const quoteSchema = z.object({ systemType: z.string().trim().min(2).max(100), tankLitres: z.coerce.number().int().min(500).max(100000).optional(), material: z.string().trim().min(2).max(100), warrantyMonths: z.coerce.number().int().min(0).max(240), priceInr: z.coerce.number().min(0).max(100000000), installationDate: z.string().datetime().optional().or(z.literal("")), notes: z.string().trim().max(1000).optional() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req: request as never });
  if (!token?.sub) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: token.sub }, select: { role: true } });
  if (!user || !["INSTALLER", "ADMIN"].includes(user.role)) return NextResponse.json({ error: "Installer access required." }, { status: 403 });
  const parsed = quoteSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter all quote details correctly." }, { status: 400 });
  const { id } = await params;
  const lead = await prisma.installerLead.findUnique({ where: { id } });
  if (!lead || (user.role !== "ADMIN" && lead.installerId !== token.sub)) return NextResponse.json({ error: "Survey request not found." }, { status: 404 });
  const quote = await prisma.installerQuote.create({ data: { leadId: id, installerId: token.sub, systemType: parsed.data.systemType, tankLitres: parsed.data.tankLitres, material: parsed.data.material, warrantyMonths: parsed.data.warrantyMonths, priceInr: parsed.data.priceInr, installationDate: parsed.data.installationDate ? new Date(parsed.data.installationDate) : null, notes: parsed.data.notes || null } });
  return NextResponse.json(quote, { status: 201 });
}
