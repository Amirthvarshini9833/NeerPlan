import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { installerContactPurposes } from "@/lib/installer-contact-purpose";
import { prisma } from "@/lib/prisma";

const leadInput = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(30).regex(/^[0-9+()\-\s]+$/, "Use a valid phone number."),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  contactPurpose: z.enum(installerContactPurposes),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req: request as never });
  if (!token?.sub) return NextResponse.json({ error: "Sign in to request a survey." }, { status: 401 });

  const parsed = leadInput.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Please provide your name, phone, city, state, and purpose." }, { status: 400 });

  const { id } = await params;
  const assessment = await prisma.assessment.findFirst({ where: { id, userId: token.sub }, select: { id: true, city: true } });
  if (!assessment) return NextResponse.json({ error: "Assessment not found." }, { status: 404 });

  const leadData = { name: parsed.data.name, phone: parsed.data.phone, contactPurpose: parsed.data.contactPurpose };
  const installers = await prisma.user.findMany({ where: { role: "INSTALLER" }, select: { id: true, serviceAreas: true } });
  const city = assessment.city.toLowerCase();
  const matched = installers.find((installer) => installer.serviceAreas?.split(",").some((area) => area.trim().toLowerCase() === city)) ?? (installers.length === 1 ? installers[0] : undefined);
  const lead = await prisma.installerLead.create({ data: { assessmentId: assessment.id, installerId: matched?.id ?? null, ...leadData } });
  return NextResponse.json({ id: lead.id, matchedInstaller: Boolean(matched) }, { status: 201 });
}
