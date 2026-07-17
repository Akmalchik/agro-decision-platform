export const FIRST_STAGE = "FIRST_STAGE" as const;
export const FIRST_STAGE_ALGORITHM_VERSION = "1.0.0" as const;

export type CropCode = "KARAM" | "MOSH" | "PIYOZ" | "KARTOSHKA" | "POMIDOR" | "SABZI" | "MAKKAJOXORI" | "LOVIYA";
export type PreviousCropCode = "BUGDOY" | "PAXTA" | "MAKKAJOXORI" | "SHOLI" | "SABZAVOT" | "DUKKAKLI" | "BOSH" | "BOSHQA";
export type WaterLevel = "LOW" | "MEDIUM" | "HIGH";
export type RotationStatus = "RECOMMENDED" | "ACCEPTABLE" | "NEUTRAL" | "UNDESIRABLE" | "RESTRICTED";

export type RecommendationReasonKey =
  | "bonitet.optimal"
  | "bonitet.acceptable"
  | "bonitet.belowMinimum"
  | "water.sufficient"
  | "water.partiallySufficient"
  | "water.insufficient"
  | `rotation.${string}`;

export type RecommendationWarningKey = "rotation.insufficientData" | "bonitet.belowMinimum";

export type RecommendationCrop = {
  id: string;
  code: CropCode;
  minBonitet: number;
  optimalBonitetMin: number;
  optimalBonitetMax: number;
  waterNeed: WaterLevel;
};

export type RotationRule = {
  nextCropCode: CropCode;
  compatibilityScore: number;
  status: RotationStatus;
  explanationKey: `rotation.${string}`;
};

export type FirstStageRecommendationItem = {
  cropCode: CropCode;
  rank: number;
  finalScore: number;
  bonitetScore: number;
  waterScore: number;
  rotationScore: number;
  status: RotationStatus;
  reasonKeys: RecommendationReasonKey[];
  warningKeys: RecommendationWarningKey[];
  stage: typeof FIRST_STAGE;
  calculatedAt: string;
  algorithmVersion: typeof FIRST_STAGE_ALGORITHM_VERSION;
};

export type FirstStageRecommendationResult = {
  recommendationId: string;
  plotId: string;
  stage: typeof FIRST_STAGE;
  calculatedAt: string;
  algorithmVersion: typeof FIRST_STAGE_ALGORITHM_VERSION;
  items: FirstStageRecommendationItem[];
};
