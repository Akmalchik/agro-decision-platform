import type { PlotRepository } from "@/modules/plots/domain/plot-repository";
import {
  FIRST_STAGE,
  FIRST_STAGE_ALGORITHM_VERSION,
  type PreviousCropCode,
  type WaterLevel,
} from "@/modules/recommendations/domain/first-stage-recommendation";
import type { RecommendationRepository } from "@/modules/recommendations/domain/recommendation-repository";
import {
  calculateBonitetScore,
  calculateFinalScore,
  calculateWaterScore,
  getBonitetReasonKey,
  getWaterReasonKey,
} from "@/modules/recommendations/domain/scoring";

const PREVIOUS_CROP_CODES: Record<string, PreviousCropCode> = {
  WHEAT: "BUGDOY",
  COTTON: "PAXTA",
  CORN: "MAKKAJOXORI",
  RICE: "SHOLI",
  VEGETABLES: "SABZAVOT",
  LEGUMES: "DUKKAKLI",
  FALLOW: "BOSH",
  OTHER: "BOSHQA",
};

const waterLevels = new Set<WaterLevel>(["LOW", "MEDIUM", "HIGH"]);

export type FirstStageRecommendationErrorCode =
  | "PLOT_NOT_FOUND"
  | "MISSING_BONITET"
  | "MISSING_WATER_SUPPLY"
  | "MISSING_PREVIOUS_CROP"
  | "NO_ACTIVE_CROPS";

export class FirstStageRecommendationError extends Error {
  constructor(public readonly code: FirstStageRecommendationErrorCode) {
    super(code);
  }
}

export class FirstStageRecommendationService {
  constructor(private readonly plots: PlotRepository, private readonly recommendations: RecommendationRepository) {}

  async calculate(plotId: string) {
    const plot = await this.plots.findById(plotId);
    if (!plot) throw new FirstStageRecommendationError("PLOT_NOT_FOUND");

    const bonitetValue = plot.soilProfile?.bonitet;
    if (bonitetValue === null || bonitetValue === undefined) throw new FirstStageRecommendationError("MISSING_BONITET");
    const bonitet = Number(bonitetValue);

    if (!plot.waterSupply || !waterLevels.has(plot.waterSupply as WaterLevel)) {
      throw new FirstStageRecommendationError("MISSING_WATER_SUPPLY");
    }
    const waterSupply = plot.waterSupply as WaterLevel;

    const previousCrop = plot.previousCrop ? PREVIOUS_CROP_CODES[plot.previousCrop] : undefined;
    if (!previousCrop) throw new FirstStageRecommendationError("MISSING_PREVIOUS_CROP");

    const [crops, rotationRules] = await Promise.all([
      this.recommendations.getActiveCrops(),
      this.recommendations.getRotationRules(previousCrop),
    ]);
    if (crops.length === 0) throw new FirstStageRecommendationError("NO_ACTIVE_CROPS");

    const rulesByCrop = new Map(rotationRules.map((rule) => [rule.nextCropCode, rule]));
    const calculatedAt = new Date();

    const rankedItems = crops
      .map((crop) => {
        const bonitetScore = calculateBonitetScore(bonitet, crop);
        const waterScore = calculateWaterScore(waterSupply, crop.waterNeed);
        const rule = rulesByCrop.get(crop.code);
        const rotationScore = rule?.compatibilityScore ?? 50;
        const warningKeys = [
          ...(!rule ? ["rotation.insufficientData" as const] : []),
          ...(bonitet < crop.minBonitet ? ["bonitet.belowMinimum" as const] : []),
        ];

        return {
          cropId: crop.id,
          cropCode: crop.code,
          rank: 0,
          finalScore: calculateFinalScore(bonitetScore, waterScore, rotationScore),
          bonitetScore,
          waterScore,
          rotationScore,
          status: rule?.status ?? "NEUTRAL" as const,
          reasonKeys: [
            getBonitetReasonKey(bonitet, crop),
            getWaterReasonKey(waterScore),
            ...(rule ? [rule.explanationKey] : []),
          ],
          warningKeys,
          stage: FIRST_STAGE,
          calculatedAt: calculatedAt.toISOString(),
          algorithmVersion: FIRST_STAGE_ALGORITHM_VERSION,
        };
      })
      .sort((left, right) => right.finalScore - left.finalScore || left.cropCode.localeCompare(right.cropCode))
      .map((item, index) => ({ ...item, rank: index + 1 }));

    return this.recommendations.saveFirstStageCalculation({
      plotId,
      bonitet,
      waterSupply,
      previousCrop,
      calculatedAt,
      rankedItems,
    });
  }
}
