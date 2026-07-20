import type { RecommendationConfidence, RecommendationConfidenceSource } from "@/modules/recommendations/domain/recommendation-confidence";

const confidenceValues = [
  { cadastralNumber: "11:10:000000612", value: 84, level: "MEDIUM" },
  { cadastralNumber: "11:10:000172582", value: 92, level: "HIGH" },
  { cadastralNumber: "11:10:000005739", value: 96, level: "HIGH" },
] satisfies RecommendationConfidence[];

const confidenceByCadastral = new Map(confidenceValues.map((item) => [item.cadastralNumber, item]));

export const piskentMvpRecommendationConfidenceSource: RecommendationConfidenceSource = {
  findByCadastralNumber(cadastralNumber) {
    return confidenceByCadastral.get(cadastralNumber) ?? null;
  },
};
