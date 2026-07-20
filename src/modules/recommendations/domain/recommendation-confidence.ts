export type ConfidenceLevel = "LOW" | "MEDIUM" | "HIGH";

export type RecommendationConfidence = {
  cadastralNumber: string;
  value: number;
  level: ConfidenceLevel;
};

export interface RecommendationConfidenceSource {
  findByCadastralNumber(cadastralNumber: string): RecommendationConfidence | null;
}
