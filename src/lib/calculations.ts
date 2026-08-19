export type RoofType = "concrete" | "metal" | "tiles";
export type BuildingType = "independent_house" | "apartment" | "commercial";
export type AvailableSpace = "limited" | "moderate" | "ample";
export type AssessmentInput = { city: string; roofAreaSqFt: number; roofType: RoofType; annualRainfallMm: number; occupants: number; buildingType: BuildingType; availableSpace: AvailableSpace };
export type RecommendationSystem = "Storage tank system" | "Groundwater recharge system" | "Hybrid storage + recharge system";
export type InstallationRecommendation = { system: RecommendationSystem; reason: string; suggestedTankLitres: number; rechargeCapacityLitres: number; costRangeInr: [number, number]; components: string[]; assumptions: string[] };
const runoff: Record<RoofType, number> = { concrete: 0.82, metal: 0.9, tiles: 0.75 };
export function recommendInstallation(input: AssessmentInput, annualCollectionLitres: number, suggestedTankLitres: number): InstallationRecommendation {
  const annualDemandLitres = input.occupants * 135 * 365;
  const collectionToDemand = annualCollectionLitres / annualDemandLitres;
  const rechargeCapacityLitres = Math.max(5000, Math.round((annualCollectionLitres * 0.35) / 1000) * 1000);
  let system: RecommendationSystem;
  if (input.availableSpace === "limited") system = collectionToDemand >= 0.65 ? "Hybrid storage + recharge system" : "Groundwater recharge system";
  else if (input.availableSpace === "ample" && input.annualRainfallMm >= 1200 && collectionToDemand >= 0.85) system = "Storage tank system";
  else if (collectionToDemand >= 0.6) system = "Hybrid storage + recharge system";
  else system = "Groundwater recharge system";
  const reason = system === "Storage tank system"
    ? `The roof can collect about ${Math.round(collectionToDemand * 100)}% of estimated annual household demand, rainfall is relatively high, and available space supports a larger tank.`
    : system === "Groundwater recharge system"
      ? `Available space is constrained or collected water is below ${Math.round(collectionToDemand * 100)}% of estimated demand, so directing filtered overflow into recharge is more practical than relying on a large tank.`
      : `The roof can supply about ${Math.round(collectionToDemand * 100)}% of estimated demand, so a moderate tank can cover useful non-potable needs while excess rainfall is sent to recharge.`;
  const costRangeInr: [number, number] = system === "Storage tank system"
    ? [Math.round((45000 + suggestedTankLitres * 12) / 5000) * 5000, Math.round((90000 + suggestedTankLitres * 24) / 5000) * 5000]
    : system === "Groundwater recharge system"
      ? [35000, Math.round((70000 + rechargeCapacityLitres * 2) / 5000) * 5000]
      : [Math.round((75000 + suggestedTankLitres * 10) / 5000) * 5000, Math.round((130000 + suggestedTankLitres * 22) / 5000) * 5000];
  const components = system === "Storage tank system"
    ? ["Roof gutters and downpipes", "Leaf screen and first-flush diverter", `${suggestedTankLitres.toLocaleString("en-IN")} L storage tank`, "Overflow, mosquito-proof lid, and tap/pump", "Basic filtration before storage"]
    : system === "Groundwater recharge system"
      ? ["Roof gutters and downpipes", "Leaf screen and first-flush diverter", "Silt trap and filter chamber", `${rechargeCapacityLitres.toLocaleString("en-IN")} L/year recharge provision`, "Recharge pit or borewell injection designed for the site"]
      : ["Roof gutters and downpipes", "Leaf screen and first-flush diverter", `${suggestedTankLitres.toLocaleString("en-IN")} L storage tank`, "Silt trap and filtration chamber", `${rechargeCapacityLitres.toLocaleString("en-IN")} L/year recharge overflow`, "Overflow diverter and inspection access"];
  return { system, reason, suggestedTankLitres, rechargeCapacityLitres, costRangeInr, components, assumptions: [`Annual household demand uses ${input.occupants} people × 135 L/day.`, `Roof collection uses ${input.annualRainfallMm} mm rainfall and the ${input.roofType} runoff coefficient.`, `Space preference: ${input.availableSpace}; building type: ${input.buildingType}.`] };
}

export function calculateAssessment(input: AssessmentInput) {
  const areaSqM = input.roofAreaSqFt * 0.092903;
  const annualCollectionLitres = Math.round(areaSqM * input.annualRainfallMm * runoff[input.roofType]);
  const suggestedTankLitres = Math.min(25000, Math.max(2000, Math.round(annualCollectionLitres / 600) * 500));
  const usableWater = Math.min(annualCollectionLitres, input.occupants * 135 * 365 * 0.42);
  const estimatedSavingsInr = Math.round(usableWater * 0.06);
  const estimatedSetupCostInr = Math.round(18500 + suggestedTankLitres * 15 + areaSqM * 120);
  return { areaSqM, runoffCoefficient: runoff[input.roofType], annualCollectionLitres, suggestedTankLitres, estimatedSavingsInr, estimatedSetupCostInr, paybackYears: estimatedSavingsInr ? estimatedSetupCostInr / estimatedSavingsInr : 0, recommendation: recommendInstallation(input, annualCollectionLitres, suggestedTankLitres) };
}
