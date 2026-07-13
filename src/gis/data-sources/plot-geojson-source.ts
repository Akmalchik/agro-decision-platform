import type { PlotMapDataset } from "@/gis/domain/geometry";

export interface PlotGeoJsonSource {
  load(): Promise<PlotMapDataset>;
}
