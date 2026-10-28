import { z } from "zod";

export const cropCodes = ["KARAM", "MOSH", "PIYOZ", "KARTOSHKA", "POMIDOR", "SABZI", "MAKKAJOXORI", "LOVIYA"] as const;
export const markets = ["LOCAL", "OTHER_REGION", "EXPORT", "CONTRACT", "UNKNOWN"] as const;
export const planSchema = z.object({
  plotId: z.uuid(), season: z.string().regex(/^20\d{2}$/), mode: z.enum(["DEMO", "USER_PLAN"]),
  revision: z.number().int().nonnegative(),
  allocations: z.array(z.object({ crop: z.enum(cropCodes), area: z.number().positive().max(1000000), market: z.enum(markets).default("UNKNOWN") })).min(1).max(8),
}).superRefine((plan, context) => {
  if (new Set(plan.allocations.map((row) => row.crop)).size !== plan.allocations.length) context.addIssue({ code: "custom", message: "DUPLICATE_CROP" });
});
export type Plan = z.infer<typeof planSchema>;
export type PlotScope = { id: string; cadastralNumber: string; farmName: string; area: number; farmId: string };
export type Submission = Plan & { updatedAt: string };
export type YieldEvidence = { crop: string; farmId?: string; tonsPerHa: number; source: string; season: string };
export type DemandEvidence = { crop: string; tons: number; source: string };
export type WaterNorm = { crop: string; cubicMetersPerHa: number; source: string };
export function estimateResources(area: number, tonsPerHa: number | null, cubicMetersPerHa: number | null) {
  if (!Number.isFinite(area) || area < 0) throw new Error("INVALID_AREA");
  return { expectedTons: tonsPerHa !== null && Number.isFinite(tonsPerHa) && tonsPerHa > 0 ? area * tonsPerHa : null,
    requiredWaterM3: cubicMetersPerHa !== null && Number.isFinite(cubicMetersPerHa) && cubicMetersPerHa > 0 ? area * cubicMetersPerHa : null };
}

export function validatePlanArea(plan: Plan, plot: PlotScope) {
  const area = plan.allocations.reduce((sum, row) => sum + row.area, 0);
  if (area > plot.area + 0.000001) throw new Error("AREA_EXCEEDS_PLOT");
  return area;
}

export function forecastDistrict(plots: PlotScope[], submissions: Submission[], season: string, mode: Plan["mode"], yields: YieldEvidence[], demand: DemandEvidence[], waterNorms: WaterNorm[] = []) {
  const scope = new Map(plots.map((plot) => [plot.id, plot]));
  const latest = new Map<string, Submission>();
  for (const submission of submissions) {
    if (submission.season !== season || submission.mode !== mode || !scope.has(submission.plotId)) continue;
    validatePlanArea(submission, scope.get(submission.plotId)!);
    const previous = latest.get(submission.plotId);
    if (!previous || submission.revision > previous.revision) latest.set(submission.plotId, submission);
  }
  const totalArea = [...scope.values()].reduce((sum, plot) => sum + plot.area, 0);
  const coveredArea = [...latest.values()].reduce((sum, plan) => sum + validatePlanArea(plan, scope.get(plan.plotId)!), 0);
  const coverage = totalArea > 0 ? coveredArea / totalArea * 100 : 0;
  const ready = totalArea > 0 && coveredArea >= totalArea * 0.8 - 0.000001;
  const rows = cropCodes.map((crop) => {
    let area = 0, production = 0, missingYieldArea = 0;
    const sources = new Set<string>();
    const marketArea: Record<string, number> = {};
    for (const plan of latest.values()) {
      const plot = scope.get(plan.plotId)!;
      for (const allocation of plan.allocations.filter((item) => item.crop === crop)) {
        area += allocation.area;
        marketArea[allocation.market] = (marketArea[allocation.market] ?? 0) + allocation.area;
        // Evidence must precede the planned season. Farm history wins over district evidence.
        const candidates = yields.filter((item) => item.crop === crop && Number(item.season) < Number(season) && Number.isFinite(item.tonsPerHa) && item.tonsPerHa > 0);
        const historical = candidates.filter((item) => item.farmId === plot.farmId).sort((a, b) => b.season.localeCompare(a.season))[0];
        const district = candidates.filter((item) => !item.farmId).sort((a, b) => b.season.localeCompare(a.season))[0];
        const evidence = historical ?? district;
        if (evidence) { production += estimateResources(allocation.area, evidence.tonsPerHa, null).expectedTons!; sources.add(evidence.source); }
        else missingYieldArea += allocation.area;
      }
    }
    const need = demand.find((item) => item.crop === crop);
    const complete = missingYieldArea === 0;
    const waterNorm = waterNorms.find((item) => item.crop === crop);
    return { crop, area, production: ready && complete ? production : null, knownProduction: ready ? production : null,
      missingYieldArea, demand: need?.tons ?? null, demandSource: need?.source ?? null,
      deficit: ready && complete && need ? Math.max(0, need.tons - production) : null,
      surplus: ready && complete && need ? Math.max(0, production - need.tons) : null,
      adjustment: ready && complete && need ? (production > need.tons ? "REVIEW_SURPLUS" : production < need.tons ? "REVIEW_DEFICIT" : "BALANCED") : "INSUFFICIENT_DATA",
      requiredWaterM3: estimateResources(area, null, waterNorm?.cubicMetersPerHa ?? null).requiredWaterM3,
      waterSource: waterNorm?.source ?? null, sources: [...sources], marketArea };
  });
  return { ready, coverage, totalArea, coveredArea, unknownArea: Math.max(0, totalArea - coveredArea), rows };
}
