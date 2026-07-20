import type { RecommendationScenarioSource } from "@/modules/recommendations/domain/recommendation-scenario-source";
import { calculateMvpMultiStageRecommendations } from "@/modules/recommendations/domain/mvp-multi-stage-rule-engine";

export class MultiStageRecommendationService {
  constructor(private readonly scenarios: RecommendationScenarioSource) {}

  getForCadastralNumber(cadastralNumber: string) {
    const scenario = this.scenarios.findByCadastralNumber(cadastralNumber);
    if (!scenario) return null;

    return {
      ...scenario,
      recommendations: calculateMvpMultiStageRecommendations(scenario)
        .sort((left, right) => right.score - left.score || left.cropCode.localeCompare(right.cropCode))
        .slice(0, 3)
        .map((recommendation, index) => ({ ...recommendation, rank: index + 1 })),
    };
  }
}
