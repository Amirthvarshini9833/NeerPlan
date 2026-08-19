import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const statusInput = z.object({ status: z.enum(["NEW", "CONTACTED", "SCHEDULED", "COMPLETED", "CLOSED"]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req: request as never });
  if (!token?.sub) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: token.sub }, select: { role: true } });
  if (!user || !["INSTALLER", "ADMIN"].includes(user.role)) return NextResponse.json({ error: "Installer access required." }, { status: 403 });
  const parsed = statusInput.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid survey status." }, { status: 400 });
  const { id } = await params;
  const lead = await prisma.installerLead.findUnique({ where: { id } });
  if (!lead || (user.role !== "ADMIN" && lead.installerId !== token.sub)) return NextResponse.json({ error: "Survey request not found." }, { status: 404 });
  const updated = await prisma.installerLead.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}
