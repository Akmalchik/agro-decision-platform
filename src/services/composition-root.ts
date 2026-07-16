import { prismaPlotRepository } from "@/database/repositories/prisma-plot.repository";
import { postgisPlotGeoJsonSource } from "@/gis/data-sources/postgis-plot-geojson-source";
import { PlotMapService } from "@/services/gis/plot-map.service";
import { PlotService } from "@/services/plots/plot.service";

export const plotService = new PlotService(prismaPlotRepository);
export const plotMapService = new PlotMapService(postgisPlotGeoJsonSource);
