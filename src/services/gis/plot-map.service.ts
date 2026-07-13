import type { PlotGeoJsonSource } from "@/gis/data-sources/plot-geojson-source";

export class PlotMapService {
  constructor(private readonly source: PlotGeoJsonSource) {}

  getDataset() {
    return this.source.load();
  }
}
