import type { RecommendationReasonKey, WaterLevel } from "@/modules/recommendations/domain/first-stage-recommendation";

const WATER_COMPATIBILITY: Record<WaterLevel, Record<WaterLevel, number>> = {
  HIGH: { LOW: 100, MEDIUM: 100, HIGH: 100 },
  MEDIUM: { LOW: 100, MEDIUM: 100, HIGH: 60 },
  LOW: { LOW: 100, MEDIUM: 60, HIGH: 20 },
};

const clampScore = (score: number) => Math.max(0, Math.min(100, Math.round(score)));

export function calculateBonitetScore(
  bonitet: number,
  crop: { minBonitet: number; optimalBonitetMin: number; optimalBonitetMax: number },
): number {
  if (!Number.isFinite(bonitet)) throw new Error("INVALID_BONITET");
  if (bonitet >= crop.optimalBonitetMin) return 100;
  if (bonitet >= crop.minBonitet) {
    const interval = crop.optimalBonitetMin - crop.minBonitet;
    return interval <= 0 ? 100 : clampScore(60 + ((bonitet - crop.minBonitet) / interval) * 40);
  }
  return crop.minBonitet <= 0 ? 50 : clampScore((bonitet / crop.minBonitet) * 50);
}

export function getBonitetReasonKey(
  bonitet: number,
  crop: { minBonitet: number; optimalBonitetMin: number },
): RecommendationReasonKey {
  if (bonitet < crop.minBonitet) return "bonitet.belowMinimum";
  if (bonitet < crop.optimalBonitetMin) return "bonitet.acceptable";
  return "bonitet.optimal";
}

export function calculateWaterScore(plotWater: WaterLevel, cropWaterNeed: WaterLevel): number {
  return WATER_COMPATIBILITY[plotWater][cropWaterNeed];
}

export function getWaterReasonKey(score: number): RecommendationReasonKey {
  if (score >= 90) return "water.sufficient";
  if (score >= 50) return "water.partiallySufficient";
  return "water.insufficient";
}

export function calculateFinalScore(bonitetScore: number, waterScore: number, rotationScore: number): number {
  return clampScore(bonitetScore * 0.4 + waterScore * 0.35 + rotationScore * 0.25);
}
