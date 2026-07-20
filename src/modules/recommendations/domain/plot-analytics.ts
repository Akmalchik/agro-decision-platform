import type { PreviousCropCode, WaterLevel } from "@/modules/recommendations/domain/first-stage-recommendation";

export type PlotAssessment = "SUFFICIENT" | "MODERATE" | "LIMITED";
export type RotationAssessment = "COMPATIBLE" | "NEUTRAL" | "UNDESIRABLE";

export type PlotAnalytics = {
  cadastralNumber: string;
  bonitet: number;
  waterAvailability: WaterLevel;
  waterAssessment: PlotAssessment;
  previousCrop: PreviousCropCode;
  plotArea: number;
  rotationAssessment: RotationAssessment;
};

export interface PlotAnalyticsSource {
  findByCadastralNumber(cadastralNumber: string): PlotAnalytics | null;
}
