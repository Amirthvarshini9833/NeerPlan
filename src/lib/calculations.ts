export type RoofType = "concrete" | "metal" | "tiles";
export type AssessmentInput = { city: string; roofAreaSqFt: number; roofType: RoofType; annualRainfallMm: number; occupants: number };
const runoff: Record<RoofType, number> = { concrete: 0.82, metal: 0.9, tiles: 0.75 };
export function calculateAssessment(input: AssessmentInput) {
  const areaSqM = input.roofAreaSqFt * 0.092903;
  const annualCollectionLitres = Math.round(areaSqM * input.annualRainfallMm * runoff[input.roofType]);
  const suggestedTankLitres = Math.min(25000, Math.max(2000, Math.round(annualCollectionLitres / 600) * 500));
  const usableWater = Math.min(annualCollectionLitres, input.occupants * 135 * 365 * 0.42);
  const estimatedSavingsInr = Math.round(usableWater * 0.06);
  const estimatedSetupCostInr = Math.round(18500 + suggestedTankLitres * 15 + areaSqM * 120);
  return { areaSqM, runoffCoefficient: runoff[input.roofType], annualCollectionLitres, suggestedTankLitres, estimatedSavingsInr, estimatedSetupCostInr, paybackYears: estimatedSavingsInr ? estimatedSetupCostInr / estimatedSavingsInr : 0 };
}
