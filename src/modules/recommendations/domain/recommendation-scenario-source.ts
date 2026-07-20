import type { CropCode, PreviousCropCode, WaterLevel } from "@/modules/recommendations/domain/first-stage-recommendation";

export type RecommendationStage = "FIRST_STAGE" | "THIRD_STAGE" | "FOURTH_STAGE";

export type ScenarioReasonKey =
  | "plot.bonitetSuitable"
  | "plot.waterSufficient"
  | "plot.rotationSuitable"
  | "plot.areaSuitable"
  | "district.demandExists"
  | "district.coverageGap"
  | "district.selectedCropsBalanced"
  | "market.deficitExists"
  | "market.lowOverproductionRisk"
  | "market.forecastPriceFavorable";

export type ScenarioRecommendation = {
  cropCode: CropCode;
  score: number;
  reasonKeys: ScenarioReasonKey[];
};

export type RecommendationScenario = {
  cadastralNumber: string;
  stage: RecommendationStage;
  districtCropDistributionPercent?: number;
  inputs: {
    plot: {
      bonitet: number;
      waterSupply: WaterLevel;
      previousCrop: PreviousCropCode;
      officialAreaHectares: number;
    };
    district?: {
      forecastDemandIndex: number;
      allocatedAreaHectares: number;
      demandCoveragePercent: number;
    };
    final?: {
      productDeficitIndex: number;
      overproductionRisk: number;
      forecastPriceIndex: number;
    };
  };
  recommendations: ScenarioRecommendation[];
};

export interface RecommendationScenarioSource {
  findByCadastralNumber(cadastralNumber: string): RecommendationScenario | null;
}
