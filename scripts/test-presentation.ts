import assert from "node:assert/strict";
import { projectStage, presentationStages } from "../src/modules/presentation/projection";
import { piskentMvpRecommendationScenarioSource as source } from "../src/modules/recommendations/data/piskent-mvp-recommendation-scenarios";
import { calculateMvpMultiStageRecommendations } from "../src/modules/recommendations/domain/mvp-multi-stage-rule-engine";
import { getPresentationMessages } from "../src/i18n/presentation";
import { getDictionary } from "../src/i18n";
import { FirstStageRecommendationService } from "../src/services/recommendations/first-stage-recommendation.service";
import { TEST_PLOT } from "../src/modules/plots/data/test-plot";
import type { RecommendationRepository } from "../src/modules/recommendations/domain/recommendation-repository";
import { FIRST_STAGE, FIRST_STAGE_ALGORITHM_VERSION } from "../src/modules/recommendations/domain/first-stage-recommendation";

async function main() {
  for (const cadastral of ["11:10:000000612", "11:10:000172582", "11:10:000005739"]) {
    const scenario = source.findByCadastralNumber(cadastral)!;
    const original = JSON.stringify(scenario);
    const expected = calculateMvpMultiStageRecommendations(scenario).filter((row) => row.eligible).sort((a, b) => b.score - a.score || a.cropCode.localeCompare(b.cropCode)).slice(0, 3);
    for (const stage of presentationStages) {
      const result = projectStage(scenario, stage);
      assert.deepEqual(result.recommendations.map((row) => [row.cropCode, row.score, row.reasonKeys]), expected.map((row) => [row.cropCode, row.score, row.reasonKeys]));
      assert.equal(result.ratingsChanged, false);
      assert.ok(result.recommendations.every((row) => row.delta === (stage === 1 ? null : 0)));
      for (const locale of ["ru", "uz-Latn", "uz-Cyrl"] as const) {
        const dictionary = getDictionary(locale);
        assert.ok(result.recommendations.every((row) => row.reasonKeys.every((key) => dictionary.multiStageRecommendation.reasonKeys[key])));
        assert.equal(Object.keys(getPresentationMessages(locale)).length, Object.keys(getPresentationMessages("ru")).length);
      }
    }
    assert.equal(JSON.stringify(scenario), original, "Stage switches must never mutate the scenario or farmer plans");
  }
  let writes = 0;
  const repository: RecommendationRepository = {
    async getActiveCrops() { return [
      { id: "mosh", code: "MOSH", minBonitet: 40, optimalBonitetMin: 55, optimalBonitetMax: 80, waterNeed: "LOW" },
      { id: "karam", code: "KARAM", minBonitet: 55, optimalBonitetMin: 70, optimalBonitetMax: 90, waterNeed: "HIGH" },
    ]; },
    async getRotationRules() { return []; },
    async saveFirstStageCalculation(input) { writes++; return { recommendationId: "saved", plotId: input.plotId, stage: FIRST_STAGE, calculatedAt: input.calculatedAt.toISOString(), algorithmVersion: FIRST_STAGE_ALGORITHM_VERSION, items: input.rankedItems.slice(0, 3) }; },
  };
  const service = new FirstStageRecommendationService({ async findById() { return { ...TEST_PLOT, waterSupply: "LOW", previousCrop: "OTHER" }; } }, repository);
  const preview = await service.preview(TEST_PLOT.id);
  assert.equal(writes, 0); assert.equal(preview.recommendationId, null);
  const saved = await service.calculate(TEST_PLOT.id);
  assert.equal(writes, 1);
  assert.deepEqual(preview.items.map((row) => [row.cropCode, row.finalScore, row.warningKeys]), saved.items.map((row) => [row.cropCode, row.finalScore, row.warningKeys]));
  assert.deepEqual(preview.excluded, saved.excluded);
  console.info("Presentation passed: real engine projection, truthful stage deltas, translated reasons, immutable scenarios, public preview without writes and matching saved results.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
