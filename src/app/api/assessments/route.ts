import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculateAssessment } from "@/lib/calculations";
const input = z.object({
  city: z.string().min(2), roofAreaSqFt: z.number().min(20).max(100000), roofType: z.enum(["concrete", "metal", "tiles"]), annualRainfallMm: z.number().min(100), occupants: z.number().int().min(1),
  areaSource: z.string().trim().min(2).max(160).optional(), areaDataSourceUrl: z.string().url().max(300).optional(), areaLocation: z.string().trim().max(160).optional(),
  rainfallSource: z.string().trim().min(2).max(160).optional(), rainfallDataPeriod: z.string().trim().max(40).optional(), rainfallRetrievedAt: z.string().datetime().optional(),
});
export async function POST(request: Request) { const token = await getToken({ req: request as never }); if (!token?.sub) return NextResponse.json({ error: "Sign in to save an assessment." }, { status: 401 }); const parsed = input.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid assessment." }, { status: 400 }); const result = calculateAssessment(parsed.data); const saved = await prisma.assessment.create({ data: { userId: token.sub, city: parsed.data.city, roofAreaSqFt: parsed.data.roofAreaSqFt, areaSource: parsed.data.areaSource ?? "Manual user input", areaDataSourceUrl: parsed.data.areaDataSourceUrl ?? null, areaLocation: parsed.data.areaLocation ?? null, roofType: parsed.data.roofType, annualRainfallMm: parsed.data.annualRainfallMm, rainfallSource: parsed.data.rainfallSource ?? "Manual user input", rainfallDataPeriod: parsed.data.rainfallDataPeriod ?? null, rainfallRetrievedAt: parsed.data.rainfallRetrievedAt ? new Date(parsed.data.rainfallRetrievedAt) : null, occupants: parsed.data.occupants, annualCollectionLitres: result.annualCollectionLitres, suggestedTankLitres: result.suggestedTankLitres, estimatedSavingsInr: result.estimatedSavingsInr, estimatedSetupCostInr: result.estimatedSetupCostInr, paybackYears: result.paybackYears } }); return NextResponse.json(saved, { status: 201 }); }
