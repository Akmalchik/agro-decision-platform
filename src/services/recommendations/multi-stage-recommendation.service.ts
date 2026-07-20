import type { RecommendationScenarioSource } from "@/modules/recommendations/domain/recommendation-scenario-source";

export class MultiStageRecommendationService {
  constructor(private readonly scenarios: RecommendationScenarioSource) {}

  getForCadastralNumber(cadastralNumber: string) {
    const scenario = this.scenarios.findByCadastralNumber(cadastralNumber);
    if (!scenario) return null;

    return {
      ...scenario,
      recommendations: [...scenario.recommendations]
        .sort((left, right) => right.score - left.score || left.cropCode.localeCompare(right.cropCode))
        .slice(0, 3)
        .map((recommendation, index) => ({ ...recommendation, rank: index + 1 })),
    };
  }
}
