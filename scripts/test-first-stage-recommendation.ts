import assert from "node:assert/strict";
import { calculateBonitetScore, calculateFinalScore, calculateWaterScore } from "../src/modules/recommendations/domain/scoring";

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

console.info("First-stage recommendation scoring tests passed.");
