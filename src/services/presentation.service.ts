import { planningPlots, readPlans } from "@/database/repositories/planning.repository";
import { demoEvidence, demoSubmissions } from "@/modules/planning/demo";
import { forecastDistrict } from "@/modules/planning/domain";
import type { PresentationData } from "@/modules/presentation/projection";
import { plotMapService, multiStageRecommendationService } from "@/services/composition-root";
import { presentationPlotDetails } from "@/database/repositories/presentation.repository";

// Public read model. No persistence, storage initialization, credentials or USER_PLAN reads.
export async function loadPresentation(): Promise<PresentationData> {
  const season = "2027";
  const [scope, map, stored] = await Promise.all([planningPlots(), plotMapService.getDataset(), readPlans(season, "DEMO")]);
  const submissions = [...demoSubmissions(scope, season).filter((plan) => !stored.submissions.some((row) => row.plotId === plan.plotId)), ...stored.submissions];
  const evidence = demoEvidence();
  const forecast = forecastDistrict(scope, submissions, season, "DEMO", evidence.yields, evidence.demand);
  const { details, viewport } = await presentationPlotDetails(scope.map((plot) => plot.id));
  const plots = scope.map((plot) => {
    const record = details.get(plot.id);
    const scenario = multiStageRecommendationService.getForCadastralNumber(plot.cadastralNumber, plot.area);
    if (!scenario) throw new Error("DEMO_SCENARIO_UNAVAILABLE");
    return { ...plot, bounds: record?.bounds ?? null,
      facts: { bonitet: record?.bonitet ?? null, waterSupply: record?.waterSupply ?? null, previousCrop: record?.previousCrop ?? null },
      scenario: { ...scenario, inputs: { ...scenario.inputs, plot: { ...scenario.inputs.plot, officialAreaHectares: plot.area } } } };
  });
  const ids = new Set(plots.map((plot) => plot.id));
  return { plots: plots.sort((a, b) => a.cadastralNumber.localeCompare(b.cadastralNumber)),
    map: { ...map, viewport, featureCollection: { ...map.featureCollection, features: map.featureCollection.features.filter((feature) => ids.has(feature.properties.plotId)) } },
    forecast, season, calculatedAt: new Date().toISOString() };
}
