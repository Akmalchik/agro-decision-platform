import type { RecommendationScenarioSource } from "@/modules/recommendations/domain/recommendation-scenario-source";
import { calculateMvpMultiStageRecommendations } from "@/modules/recommendations/domain/mvp-multi-stage-rule-engine";

export class MultiStageRecommendationService {
  constructor(private readonly scenarios: RecommendationScenarioSource) {}

  getForCadastralNumber(cadastralNumber: string, fallbackArea?: number) {
    let scenario = this.scenarios.findByCadastralNumber(cadastralNumber);
    if (!scenario && fallbackArea !== undefined) {
      const fixture = this.scenarios.findByCadastralNumber("11:10:000000612");
      if (fixture) scenario = { ...fixture, cadastralNumber, stage: "FIRST_STAGE", inputs: { plot: { ...fixture.inputs.plot, officialAreaHectares: fallbackArea } } };
    }
    if (!scenario) return null;

    return {
      ...scenario,
      recommendations: calculateMvpMultiStageRecommendations(scenario)
        .filter((item) => item.eligible)
        .sort((left, right) => right.score - left.score || left.cropCode.localeCompare(right.cropCode))
        .slice(0, 3)
        .map((recommendation, index) => ({ ...recommendation, rank: index + 1 })),
      excluded: calculateMvpMultiStageRecommendations(scenario).filter((item) => !item.eligible),
    };
  }
}
