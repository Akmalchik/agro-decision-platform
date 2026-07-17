import type {
  FirstStageRecommendationItem,
  FirstStageRecommendationResult,
  PreviousCropCode,
  RecommendationCrop,
  RotationRule,
  WaterLevel,
} from "@/modules/recommendations/domain/first-stage-recommendation";

export type SaveFirstStageCalculation = {
  plotId: string;
  bonitet: number;
  waterSupply: WaterLevel;
  previousCrop: PreviousCropCode;
  calculatedAt: Date;
  rankedItems: Array<FirstStageRecommendationItem & { cropId: string }>;
};

export interface RecommendationRepository {
  getActiveCrops(): Promise<RecommendationCrop[]>;
  getRotationRules(previousCrop: PreviousCropCode): Promise<RotationRule[]>;
  saveFirstStageCalculation(input: SaveFirstStageCalculation): Promise<FirstStageRecommendationResult>;
}
