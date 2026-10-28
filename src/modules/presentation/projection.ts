import type { PlotMapDataset, MapViewport } from "@/gis/domain/geometry";
import type { PlotScope, forecastDistrict } from "@/modules/planning/domain";
import type { RecommendationScenario } from "@/modules/recommendations/domain/recommendation-scenario-source";
import { calculateMvpMultiStageRecommendations } from "@/modules/recommendations/domain/mvp-multi-stage-rule-engine";

export const presentationStages = [1, 3, 4] as const;
export type PresentationStage = (typeof presentationStages)[number];
export function projectStage(scenario: RecommendationScenario, stage: PresentationStage) {
  const stageCode = stage === 1 ? "FIRST_STAGE" : stage === 3 ? "THIRD_STAGE" : "FOURTH_STAGE";
  const results = calculateMvpMultiStageRecommendations({ ...scenario, stage: stageCode });
  const previousStage = stage === 1 ? null : stage === 3 ? "FIRST_STAGE" : "THIRD_STAGE";
  const previous = previousStage ? calculateMvpMultiStageRecommendations({ ...scenario, stage: previousStage }) : [];
  const recommendations = results.filter((item) => item.eligible)
    .sort((a, b) => b.score - a.score || a.cropCode.localeCompare(b.cropCode)).slice(0, 3)
    .map((item, index) => ({ ...item, rank: index + 1, delta: previousStage ? item.score - (previous.find((row) => row.cropCode === item.cropCode)?.score ?? item.score) : null }));
  return { stage, recommendations, excluded: results.filter((item) => !item.eligible), ratingsChanged: recommendations.some((item) => item.delta !== null && item.delta !== 0) };
}
export type PresentationPlot = PlotScope & {
  bounds: MapViewport | null;
  facts: { bonitet: string | null; waterSupply: string | null; previousCrop: string | null };
  scenario: RecommendationScenario;
};
export type PresentationData = { plots: PresentationPlot[]; map: PlotMapDataset; forecast: ReturnType<typeof forecastDistrict>; season: string; calculatedAt: string };
