import assert from "node:assert/strict";
import { calculateBonitetScore, calculateFinalScore, calculateWaterScore } from "../src/modules/recommendations/domain/scoring";
import { piskentMvpRecommendationScenarioSource } from "../src/modules/recommendations/data/piskent-mvp-recommendation-scenarios";
import { MultiStageRecommendationService } from "../src/services/recommendations/multi-stage-recommendation.service";

const crop = { minBonitet: 40, optimalBonitetMin: 60, optimalBonitetMax: 80 };

assert.equal(calculateBonitetScore(60, crop), 100);
assert.equal(calculateBonitetScore(95, crop), 100);
assert.equal(calculateBonitetScore(20, crop), 25);
assert.equal(calculateBonitetScore(50, crop), 80);
assert.equal(calculateWaterScore("HIGH", "HIGH"), 100);
assert.equal(calculateWaterScore("MEDIUM", "HIGH"), 60);
assert.equal(calculateWaterScore("LOW", "HIGH"), 20);
assert.equal(calculateWaterScore("HIGH", "LOW"), 100);
assert.equal(calculateFinalScore(100, 60, 95), 85);

const multiStageService = new MultiStageRecommendationService(piskentMvpRecommendationScenarioSource);
const firstStage = multiStageService.getForCadastralNumber("11:10:000000612");
const thirdStage = multiStageService.getForCadastralNumber("11:10:000172582");
const fourthStage = multiStageService.getForCadastralNumber("11:10:000005739");

assert.equal(firstStage?.stage, "FIRST_STAGE");
assert.equal(thirdStage?.stage, "THIRD_STAGE");
assert.equal(thirdStage?.districtCropDistributionPercent, 80);
assert.equal(fourthStage?.stage, "FOURTH_STAGE");
assert.equal(firstStage?.recommendations.length, 3);
assert.equal(thirdStage?.recommendations.length, 3);
assert.equal(fourthStage?.recommendations.length, 3);
assert.equal(multiStageService.getForCadastralNumber("unknown"), null);

console.info("First-stage recommendation scoring tests passed.");
