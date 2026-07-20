import type { RecommendationScenario, RecommendationScenarioSource } from "@/modules/recommendations/domain/recommendation-scenario-source";

const scenarios = [
  {
    cadastralNumber: "11:10:000000612",
    stage: "FIRST_STAGE",
    inputs: {
      plot: { bonitet: 68, waterSupply: "MEDIUM", previousCrop: "BUGDOY", officialAreaHectares: 30.72 },
    },
    recommendations: [],
  },
  {
    cadastralNumber: "11:10:000172582",
    stage: "THIRD_STAGE",
    districtCropDistributionPercent: 80,
    inputs: {
      plot: { bonitet: 57, waterSupply: "HIGH", previousCrop: "PAXTA", officialAreaHectares: 193.33 },
      district: { forecastDemandIndex: 88, allocatedAreaHectares: 154.66, demandCoveragePercent: 80 },
    },
    recommendations: [],
  },
  {
    cadastralNumber: "11:10:000005739",
    stage: "FOURTH_STAGE",
    inputs: {
      plot: { bonitet: 74, waterSupply: "HIGH", previousCrop: "BUGDOY", officialAreaHectares: 40.4 },
      district: { forecastDemandIndex: 93, allocatedAreaHectares: 31.8, demandCoveragePercent: 74 },
      final: { productDeficitIndex: 89, overproductionRisk: 18, forecastPriceIndex: 86 },
    },
    recommendations: [],
  },
] satisfies RecommendationScenario[];

const scenarioByCadastral = new Map(scenarios.map((scenario) => [scenario.cadastralNumber, scenario]));

export const piskentMvpRecommendationScenarioSource: RecommendationScenarioSource = {
  findByCadastralNumber(cadastralNumber) {
    return scenarioByCadastral.get(cadastralNumber) ?? null;
  },
};
