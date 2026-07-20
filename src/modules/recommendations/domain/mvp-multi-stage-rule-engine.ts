import type { CropCode, PreviousCropCode, WaterLevel } from "@/modules/recommendations/domain/first-stage-recommendation";
import type { RecommendationScenario, ScenarioReasonKey } from "@/modules/recommendations/domain/recommendation-scenario-source";
import { calculateBonitetScore, calculateWaterScore } from "@/modules/recommendations/domain/scoring";

type CropRule = {
  code: CropCode;
  minBonitet: number;
  optimalBonitetMin: number;
  optimalBonitetMax: number;
  waterNeed: WaterLevel;
  rotation: Partial<Record<PreviousCropCode, number>>;
  districtPriority: number;
  finalPriority: number;
};

const cropRules: CropRule[] = [
  { code: "KARAM", minBonitet: 55, optimalBonitetMin: 70, optimalBonitetMax: 90, waterNeed: "HIGH", rotation: { BUGDOY: 92, PAXTA: 72, DUKKAKLI: 90 }, districtPriority: 82, finalPriority: 96 },
  { code: "MOSH", minBonitet: 40, optimalBonitetMin: 55, optimalBonitetMax: 80, waterNeed: "LOW", rotation: { BUGDOY: 100, PAXTA: 96, MAKKAJOXORI: 82 }, districtPriority: 96, finalPriority: 78 },
  { code: "PIYOZ", minBonitet: 50, optimalBonitetMin: 65, optimalBonitetMax: 85, waterNeed: "MEDIUM", rotation: { BUGDOY: 84, PAXTA: 90, DUKKAKLI: 88 }, districtPriority: 88, finalPriority: 93 },
  { code: "KARTOSHKA", minBonitet: 50, optimalBonitetMin: 65, optimalBonitetMax: 85, waterNeed: "HIGH", rotation: { BUGDOY: 78, PAXTA: 74, DUKKAKLI: 90 }, districtPriority: 80, finalPriority: 86 },
  { code: "POMIDOR", minBonitet: 55, optimalBonitetMin: 70, optimalBonitetMax: 90, waterNeed: "HIGH", rotation: { BUGDOY: 80, PAXTA: 82, DUKKAKLI: 92 }, districtPriority: 86, finalPriority: 91 },
  { code: "SABZI", minBonitet: 45, optimalBonitetMin: 60, optimalBonitetMax: 85, waterNeed: "MEDIUM", rotation: { BUGDOY: 76, PAXTA: 88, DUKKAKLI: 84 }, districtPriority: 92, finalPriority: 84 },
  { code: "MAKKAJOXORI", minBonitet: 45, optimalBonitetMin: 60, optimalBonitetMax: 85, waterNeed: "MEDIUM", rotation: { BUGDOY: 70, PAXTA: 92, DUKKAKLI: 86 }, districtPriority: 84, finalPriority: 80 },
  { code: "LOVIYA", minBonitet: 40, optimalBonitetMin: 55, optimalBonitetMax: 80, waterNeed: "LOW", rotation: { BUGDOY: 94, PAXTA: 90, MAKKAJOXORI: 84 }, districtPriority: 90, finalPriority: 82 },
];

const DEFAULT_ROTATION_SCORE = 60;

function calculateAreaScore(areaHectares: number) {
  if (areaHectares >= 10) return 100;
  if (areaHectares >= 3) return 80;
  return 65;
}

function calculateStageScore(rule: CropRule, scenario: RecommendationScenario) {
  if (scenario.stage === "FIRST_STAGE") return 70;
  if (scenario.stage === "THIRD_STAGE") return rule.districtPriority;
  return rule.finalPriority;
}

function collectReasons(
  scenario: RecommendationScenario,
  rule: CropRule,
  scores: { bonitet: number; water: number; rotation: number; area: number; stage: number },
) {
  const reasons: ScenarioReasonKey[] = [];

  if (scores.bonitet >= 80) reasons.push("plot.bonitetSuitable");
  if (scores.water >= 80) reasons.push("plot.waterSufficient");
  if (scores.rotation >= 75) reasons.push("plot.rotationSuitable");
  if (scores.area >= 80) reasons.push("plot.areaSuitable");

  const district = scenario.inputs.district;
  if (district && scores.stage >= 75 && district.forecastDemandIndex >= 70) reasons.push("district.demandExists");
  if (district && district.demandCoveragePercent < 90) reasons.push("district.coverageGap");
  if (scenario.stage !== "FIRST_STAGE" && scores.stage >= 85) reasons.push("district.selectedCropsBalanced");

  const final = scenario.inputs.final;
  if (final && rule.finalPriority >= 75 && final.productDeficitIndex >= 70) reasons.push("market.deficitExists");
  if (final && final.overproductionRisk <= 30) reasons.push("market.lowOverproductionRisk");
  if (final && rule.finalPriority >= 75 && final.forecastPriceIndex >= 70) reasons.push("market.forecastPriceFavorable");

  return reasons;
}

export function calculateMvpMultiStageRecommendations(scenario: RecommendationScenario) {
  const plot = scenario.inputs.plot;

  return cropRules.map((rule) => {
    const bonitetScore = calculateBonitetScore(plot.bonitet, rule);
    const waterScore = calculateWaterScore(plot.waterSupply, rule.waterNeed);
    const rotationScore = rule.rotation[plot.previousCrop] ?? DEFAULT_ROTATION_SCORE;
    const areaScore = calculateAreaScore(plot.officialAreaHectares);
    const stageScore = calculateStageScore(rule, scenario);
    const score = Math.round(
      bonitetScore * 0.35 + waterScore * 0.25 + rotationScore * 0.2 + areaScore * 0.1 + stageScore * 0.1,
    );

    return {
      cropCode: rule.code,
      score,
      reasonKeys: collectReasons(scenario, rule, {
        bonitet: bonitetScore,
        water: waterScore,
        rotation: rotationScore,
        area: areaScore,
        stage: stageScore,
      }),
    };
  });
}
