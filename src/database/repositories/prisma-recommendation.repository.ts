import { Prisma } from "@prisma/client";
import { prisma } from "@/database/prisma";
import {
  FIRST_STAGE,
  FIRST_STAGE_ALGORITHM_VERSION,
  type CropCode,
  type FirstStageRecommendationItem,
  type RotationStatus,
  type WaterLevel,
} from "@/modules/recommendations/domain/first-stage-recommendation";
import type { RecommendationRepository } from "@/modules/recommendations/domain/recommendation-repository";

const cropCodes = new Set<CropCode>(["KARAM", "MOSH", "PIYOZ", "KARTOSHKA", "POMIDOR", "SABZI", "MAKKAJOXORI", "LOVIYA"]);
const waterLevels = new Set<WaterLevel>(["LOW", "MEDIUM", "HIGH"]);
const statuses = new Set<RotationStatus>(["RECOMMENDED", "ACCEPTABLE", "NEUTRAL", "UNDESIRABLE", "RESTRICTED"]);

export const prismaRecommendationRepository: RecommendationRepository = {
  async getActiveCrops() {
    const crops = await prisma.crop.findMany({
      where: { active: true },
      select: {
        id: true,
        code: true,
        minBonitet: true,
        optimalBonitetMin: true,
        optimalBonitetMax: true,
        waterNeed: true,
      },
      orderBy: { code: "asc" },
    });

    return crops.flatMap((crop) => {
      if (!cropCodes.has(crop.code as CropCode) || !waterLevels.has(crop.waterNeed as WaterLevel)) return [];
      return [{ ...crop, code: crop.code as CropCode, waterNeed: crop.waterNeed as WaterLevel }];
    });
  },

  async getRotationRules(previousCrop) {
    const rules = await prisma.cropRotationRule.findMany({
      where: { previousCropCode: previousCrop },
      select: { nextCropCode: true, compatibilityScore: true, status: true, explanationKey: true },
    });

    return rules.flatMap((rule) => {
      if (!cropCodes.has(rule.nextCropCode as CropCode) || !statuses.has(rule.status as RotationStatus)) return [];
      return [{
        nextCropCode: rule.nextCropCode as CropCode,
        compatibilityScore: rule.compatibilityScore,
        status: rule.status as RotationStatus,
        explanationKey: rule.explanationKey as `rotation.${string}`,
      }];
    });
  },

  async saveFirstStageCalculation(input) {
    const recommendationId = crypto.randomUUID();

    await prisma.$transaction(async (transaction) => {
      await transaction.recommendation.create({
        data: {
          id: recommendationId,
          plotId: input.plotId,
          stage: FIRST_STAGE,
          calculatedAt: input.calculatedAt,
          algorithmVersion: FIRST_STAGE_ALGORITHM_VERSION,
          inputBonitet: new Prisma.Decimal(input.bonitet),
          inputWaterSupply: input.waterSupply,
          inputPreviousCrop: input.previousCrop,
        },
      });

      await transaction.recommendationItem.createMany({
        data: input.rankedItems.map((item) => ({
          id: crypto.randomUUID(),
          recommendationId,
          cropId: item.cropId,
          rank: item.rank,
          finalScore: item.finalScore,
          bonitetScore: item.bonitetScore,
          waterScore: item.waterScore,
          rotationScore: item.rotationScore,
          status: item.status,
          reasonKeys: item.reasonKeys,
          warningKeys: item.warningKeys,
        })),
      });
    });

    return {
      recommendationId,
      plotId: input.plotId,
      stage: FIRST_STAGE,
      calculatedAt: input.calculatedAt.toISOString(),
      algorithmVersion: FIRST_STAGE_ALGORITHM_VERSION,
      items: input.rankedItems.slice(0, 3).map((item): FirstStageRecommendationItem => ({
        cropCode: item.cropCode,
        rank: item.rank,
        finalScore: item.finalScore,
        bonitetScore: item.bonitetScore,
        waterScore: item.waterScore,
        rotationScore: item.rotationScore,
        status: item.status,
        reasonKeys: item.reasonKeys,
        warningKeys: item.warningKeys,
        stage: item.stage,
        calculatedAt: item.calculatedAt,
        algorithmVersion: item.algorithmVersion,
      })),
    };
  },
};
