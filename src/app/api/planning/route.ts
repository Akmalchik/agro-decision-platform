import { z } from "zod";
import { apiError, readJson, requireWriter } from "@/api/http";
import { planningPlots, readPlans, savePlan } from "@/database/repositories/planning.repository";
import { planSchema, forecastDistrict } from "@/modules/planning/domain";
import { demoEvidence, demoSubmissions, interdistrictOptions } from "@/modules/planning/demo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const querySchema = z.object({ season: z.string().regex(/^20\d{2}$/), mode: z.enum(["DEMO", "USER_PLAN"]) });
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const { season, mode } = querySchema.parse({ season: url.searchParams.get("season"), mode: url.searchParams.get("mode") });
    if (mode === "USER_PLAN") requireWriter(request);
    const plots = await planningPlots();
    const { submissions: saved, storageReady } = await readPlans(season, mode);
    const submissions = mode === "DEMO" ? [...demoSubmissions(plots, season).filter((item) => !saved.some((row) => row.plotId === item.plotId)), ...saved] : saved;
    const evidence = mode === "DEMO" ? demoEvidence() : { yields: [], demand: [] };
    const forecast = forecastDistrict(plots, submissions, season, mode, evidence.yields, evidence.demand);
    return Response.json({ data: { plots, submissions, forecast, options: interdistrictOptions(forecast.rows, mode), storageReady, mode,
      source: mode === "DEMO" ? "DEMONSTRATION" : "USER_REPORTED", scope: "PISKENT_PILOT_ONLY", calculatedAt: new Date().toISOString() } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { if (error instanceof z.ZodError) return Response.json({ error: { code: "INVALID_INPUT" } }, { status: 400 }); return apiError(error); }
}
export async function POST(request: Request) {
  try { requireWriter(request); const input = await readJson(request, planSchema); return Response.json({ data: await savePlan(input) }); }
  catch (error) { return apiError(error); }
}
