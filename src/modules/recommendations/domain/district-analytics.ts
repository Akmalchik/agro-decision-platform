import type { CropCode } from "@/modules/recommendations/domain/first-stage-recommendation";

export type AnalyticsLevel = "LOW" | "MEDIUM" | "HIGH";

export type DistrictAnalytics = {
  cadastralNumber: string;
  cropId: CropCode;
  requiredTons: number;
  currentProduction: number;
  allocatedArea: number;
  plannedArea: number;
  forecastPrice: number;
  forecastPriceLevel: AnalyticsLevel;
  overproductionRisk: AnalyticsLevel;
  coveragePercent: number;
};

export interface DistrictAnalyticsSource {
  findByCadastralAndCrop(cadastralNumber: string, cropId: CropCode): DistrictAnalytics | null;
}
