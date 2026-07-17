import type { Polygon } from "geojson";
import type { PlotGeometryDetails, PlotGeometryMetrics } from "@/gis/domain/plot-geometry-metrics";
import type { PreviousCrop, WaterSupply } from "@/modules/plots/domain/plot-classification";

export type CreatePlotInput = {
  geometry: Polygon;
  cadastralNumber: string;
  taxId: string;
  farmName: string;
  bonitet: number;
  waterSupply: WaterSupply;
  previousCrop: PreviousCrop;
};

export interface PlotWriteRepository {
  inspectGeometry(geometry: Polygon): Promise<PlotGeometryMetrics | null>;
  findGeometryById(id: string): Promise<PlotGeometryDetails | null>;
  create(input: CreatePlotInput): Promise<string>;
}
