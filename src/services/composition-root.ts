import { inMemoryPlotRepository } from "@/database/repositories/in-memory-plot.repository";
import { testPlotGeoJsonSource } from "@/gis/data-sources/test-plot-geojson-source";
import { PlotMapService } from "@/services/gis/plot-map.service";
import { PlotService } from "@/services/plots/plot.service";

export const plotService = new PlotService(inMemoryPlotRepository);
export const plotMapService = new PlotMapService(testPlotGeoJsonSource);
