import type { PresentationPlot } from "./projection";
import { calculateMvpMultiStageRecommendations } from "@/modules/recommendations/domain/mvp-multi-stage-rule-engine";
import { projectRegionalDistrict, regionalDemoDistricts } from "@/modules/regional/demo";
import { proposeTransfers } from "@/modules/planning/logistics";

// Presentation alias only: never compare with, overwrite or persist a real tax ID.
export const FARMER_DEMO_STIR = "123456789";
export const FARMER_DEMO_CADASTRAL = "11:10:000005739";
export function findDemoFarm(plots: PresentationPlot[], stir: string) {
  if (stir.trim() !== FARMER_DEMO_STIR) return null;
  const anchor = plots.find(plot => plot.cadastralNumber === FARMER_DEMO_CADASTRAL);
  if (!anchor) return null;
  const farmPlots = plots.filter(plot => plot.farmId === anchor.farmId);
  return { id: anchor.farmId, name: anchor.farmName, plots: farmPlots, area: farmPlots.reduce((sum, plot) => sum + plot.area, 0) };
}
export function farmerSuitability(plot: PresentationPlot) {
  const rows = calculateMvpMultiStageRecommendations({ ...plot.scenario, stage: "FIRST_STAGE" });
  const eligible = rows.filter(row => row.eligible).sort((a,b) => b.score-a.score || a.cropCode.localeCompare(b.cropCode));
  return { top: eligible.slice(0,3), additional: eligible.slice(3), excluded: rows.filter(row => !row.eligible) };
}
export function farmerDistrictContext(crop: string) {
  const district = projectRegionalDistrict(regionalDemoDistricts.PISKENT);
  const product = district.products.find(row => row.code === crop) ?? null;
  // Independent, explicit internal scenario for illustrating neighboring demand.
  // No invented road evidence, confirmed buyer or automatically allocated shipment.
  const buka = crop === "KARTOSHKA" ? {
    population: 50000, kgPerPerson: 140, plannedHa: 262.5, yieldTonsPerHa: 24,
    production: 262.5 * 24, demand: 50000 * 140 / 1000,
  } : null;
  const deficit = buka ? Math.max(0,buka.demand-buka.production) : null;
  const options = product && buka ? proposeTransfers("PISKENT", [{ crop, surplus: product.balance === null ? null : Math.max(0,product.balance) }],
    [{district:"BUKA",crop,production:buka.production,demand:buka.demand,source:"INTERNAL DEMO: population × consumption; planned area × yield"}], [], []) : [];
  return { district, product, buka, deficit, option: options[0] ?? null };
}
