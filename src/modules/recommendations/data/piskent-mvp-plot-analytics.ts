import type { PlotAnalytics, PlotAnalyticsSource } from "@/modules/recommendations/domain/plot-analytics";

const analytics = [
  {
    cadastralNumber: "11:10:000000612",
    bonitet: 68,
    waterAvailability: "MEDIUM",
    waterAssessment: "SUFFICIENT",
    previousCrop: "BUGDOY",
    plotArea: 30.72,
    rotationAssessment: "COMPATIBLE",
  },
  {
    cadastralNumber: "11:10:000172582",
    bonitet: 57,
    waterAvailability: "HIGH",
    waterAssessment: "SUFFICIENT",
    previousCrop: "PAXTA",
    plotArea: 193.33,
    rotationAssessment: "COMPATIBLE",
  },
  {
    cadastralNumber: "11:10:000005739",
    bonitet: 74,
    waterAvailability: "HIGH",
    waterAssessment: "SUFFICIENT",
    previousCrop: "BUGDOY",
    plotArea: 40.4,
    rotationAssessment: "COMPATIBLE",
  },
] satisfies PlotAnalytics[];

const analyticsByCadastral = new Map(analytics.map((item) => [item.cadastralNumber, item]));

export const piskentMvpPlotAnalyticsSource: PlotAnalyticsSource = {
  findByCadastralNumber(cadastralNumber) {
    return analyticsByCadastral.get(cadastralNumber) ?? null;
  },
};
