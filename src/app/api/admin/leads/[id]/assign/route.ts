import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const assignmentInput = z.object({ installerId: z.string().min(1) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req: request as never });
  if (!token?.sub) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const admin = await prisma.user.findUnique({ where: { id: token.sub }, select: { role: true } });
  if (admin?.role !== "ADMIN") return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const parsed = assignmentInput.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Choose an installer." }, { status: 400 });
  const installer = await prisma.user.findFirst({ where: { id: parsed.data.installerId, role: "INSTALLER" }, select: { id: true } });
  if (!installer) return NextResponse.json({ error: "Installer not found." }, { status: 404 });
  const { id } = await params;
  const lead = await prisma.installerLead.update({ where: { id }, data: { installerId: installer.id } }).catch(() => null);
  if (!lead) return NextResponse.json({ error: "Survey request not found." }, { status: 404 });
  return NextResponse.json(lead);
}
