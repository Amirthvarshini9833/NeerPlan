import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculateAssessment } from "@/lib/calculations";
const input = z.object({ city: z.string().min(2), roofAreaSqFt: z.number().min(20), roofType: z.enum(["concrete", "metal", "tiles"]), annualRainfallMm: z.number().min(100), occupants: z.number().int().min(1) });
export async function POST(request: Request) { const token = await getToken({ req: request as never }); if (!token?.sub) return NextResponse.json({ error: "Sign in to save an assessment." }, { status: 401 }); const parsed = input.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid assessment." }, { status: 400 }); const result = calculateAssessment(parsed.data); const saved = await prisma.assessment.create({ data: { userId: token.sub, city: parsed.data.city, roofAreaSqFt: parsed.data.roofAreaSqFt, roofType: parsed.data.roofType, annualRainfallMm: parsed.data.annualRainfallMm, occupants: parsed.data.occupants, annualCollectionLitres: result.annualCollectionLitres, suggestedTankLitres: result.suggestedTankLitres, estimatedSavingsInr: result.estimatedSavingsInr, estimatedSetupCostInr: result.estimatedSetupCostInr, paybackYears: result.paybackYears } }); return NextResponse.json(saved, { status: 201 }); }
