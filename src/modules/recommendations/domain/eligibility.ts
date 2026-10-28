import type { RecommendationCrop, RotationRule, WaterLevel } from "./first-stage-recommendation";
import { calculateBonitetScore, calculateWaterScore } from "./scoring";

export type ExclusionReason = "bonitet.belowMinimum" | "water.insufficient" | "rotation.restricted";
export function evaluateCrop(bonitet: number, water: WaterLevel, crop: RecommendationCrop, rule?: RotationRule) {
  if (!Number.isFinite(bonitet) || bonitet < 0 || bonitet > 100) throw new Error("INVALID_BONITET");
  const bonitetScore = calculateBonitetScore(bonitet, crop);
  const waterScore = calculateWaterScore(water, crop.waterNeed);
  const rotationScore = rule?.compatibilityScore ?? null;
  const exclusions: ExclusionReason[] = [];
  if (bonitet < crop.minBonitet) exclusions.push("bonitet.belowMinimum");
  if (waterScore < 50) exclusions.push("water.insufficient");
  if (rule?.status === "RESTRICTED") exclusions.push("rotation.restricted");
  // Preserve the established relative weights. Missing evidence has no invented score.
  const knownWeight = rotationScore === null ? 0.75 : 1;
  const score = Math.round((bonitetScore * 0.4 + waterScore * 0.35 + (rotationScore ?? 0) * 0.25) / knownWeight);
  return { eligible: exclusions.length === 0, exclusions, bonitetScore, waterScore, rotationScore, score };
}
