import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateAssessment } from "@/lib/calculations";

const assessmentInput = z.object({
  city: z.string().trim().min(2).max(100),
  roofAreaSqFt: z.number().min(20).max(100000),
  roofType: z.enum(["concrete", "metal", "tiles"]),
  annualRainfallMm: z.number().min(100).max(10000),
  occupants: z.number().int().min(1).max(10000),
  buildingType: z.enum(["independent_house", "apartment", "commercial"]).default("independent_house"),
  availableSpace: z.enum(["limited", "moderate", "ample"]).default("moderate"),
});

export async function POST(request: Request) {
  const parsed = assessmentInput.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Please check the assessment details." }, { status: 400 });
  return NextResponse.json({ input: parsed.data, result: calculateAssessment(parsed.data), calculationVersion: "1.0" });
}
