import type { RecommendationScenario, RecommendationScenarioSource } from "@/modules/recommendations/domain/recommendation-scenario-source";

const scenarios = [
  {
    cadastralNumber: "11:10:000000612",
    stage: "FIRST_STAGE",
    inputs: {
      plot: { bonitet: 67, waterSupply: "MEDIUM", previousCrop: "BUGDOY", officialAreaHectares: 30.72 },
    },
    recommendations: [
      { cropCode: "MOSH", score: 92, reasonKeys: ["plot.bonitetSuitable", "plot.waterSufficient", "plot.rotationSuitable", "plot.areaSuitable"] },
      { cropCode: "KARAM", score: 88, reasonKeys: ["plot.bonitetSuitable", "plot.waterSufficient", "plot.rotationSuitable"] },
      { cropCode: "PIYOZ", score: 84, reasonKeys: ["plot.bonitetSuitable", "plot.waterSufficient", "plot.areaSuitable"] },
    ],
  },
  {
    cadastralNumber: "11:10:000172582",
    stage: "THIRD_STAGE",
    districtCropDistributionPercent: 80,
    inputs: {
      plot: { bonitet: 72, waterSupply: "HIGH", previousCrop: "PAXTA", officialAreaHectares: 193.33 },
      district: { forecastDemandIndex: 88, allocatedAreaHectares: 154.66, demandCoveragePercent: 80 },
    },
    recommendations: [
      { cropCode: "MOSH", score: 94, reasonKeys: ["plot.bonitetSuitable", "plot.rotationSuitable", "district.demandExists", "district.coverageGap"] },
      { cropCode: "SABZI", score: 90, reasonKeys: ["plot.bonitetSuitable", "plot.waterSufficient", "district.selectedCropsBalanced"] },
      { cropCode: "PIYOZ", score: 87, reasonKeys: ["plot.waterSufficient", "district.demandExists", "district.coverageGap"] },
    ],
  },
  {
    cadastralNumber: "11:10:000005739",
    stage: "FOURTH_STAGE",
    inputs: {
      plot: { bonitet: 75, waterSupply: "HIGH", previousCrop: "BUGDOY", officialAreaHectares: 40.4 },
      district: { forecastDemandIndex: 93, allocatedAreaHectares: 31.8, demandCoveragePercent: 74 },
      final: { productDeficitIndex: 89, overproductionRisk: 18, forecastPriceIndex: 86 },
    },
    recommendations: [
      { cropCode: "KARAM", score: 96, reasonKeys: ["plot.bonitetSuitable", "plot.waterSufficient", "district.demandExists", "market.deficitExists", "market.lowOverproductionRisk", "market.forecastPriceFavorable"] },
      { cropCode: "PIYOZ", score: 93, reasonKeys: ["plot.rotationSuitable", "district.coverageGap", "market.deficitExists", "market.forecastPriceFavorable"] },
      { cropCode: "POMIDOR", score: 89, reasonKeys: ["plot.bonitetSuitable", "plot.waterSufficient", "district.selectedCropsBalanced", "market.lowOverproductionRisk"] },
    ],
  },
] satisfies RecommendationScenario[];

const scenarioByCadastral = new Map(scenarios.map((scenario) => [scenario.cadastralNumber, scenario]));

export const piskentMvpRecommendationScenarioSource: RecommendationScenarioSource = {
  findByCadastralNumber(cadastralNumber) {
    return scenarioByCadastral.get(cadastralNumber) ?? null;
  },
};
