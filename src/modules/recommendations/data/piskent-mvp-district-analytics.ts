import type { DistrictAnalytics, DistrictAnalyticsSource } from "@/modules/recommendations/domain/district-analytics";

const analytics = [
  {
    cadastralNumber: "11:10:000000612",
    cropId: "MOSH",
    requiredTons: 180,
    currentProduction: 130,
    allocatedArea: 310,
    plannedArea: 450,
    forecastPrice: 4800,
    forecastPriceLevel: "HIGH",
    overproductionRisk: "LOW",
    coveragePercent: 72,
  },
  {
    cadastralNumber: "11:10:000172582",
    cropId: "MOSH",
    requiredTons: 240,
    currentProduction: 168,
    allocatedArea: 380,
    plannedArea: 540,
    forecastPrice: 4650,
    forecastPriceLevel: "MEDIUM",
    overproductionRisk: "LOW",
    coveragePercent: 70,
  },
  {
    cadastralNumber: "11:10:000005739",
    cropId: "KARAM",
    requiredTons: 320,
    currentProduction: 205,
    allocatedArea: 420,
    plannedArea: 650,
    forecastPrice: 5200,
    forecastPriceLevel: "HIGH",
    overproductionRisk: "LOW",
    coveragePercent: 64,
  },
] satisfies DistrictAnalytics[];

const analyticsByPlotAndCrop = new Map(
  analytics.map((item) => [`${item.cadastralNumber}:${item.cropId}`, item]),
);

export const piskentMvpDistrictAnalyticsSource: DistrictAnalyticsSource = {
  findByCadastralAndCrop(cadastralNumber, cropId) {
    return analyticsByPlotAndCrop.get(`${cadastralNumber}:${cropId}`) ?? null;
  },
};
