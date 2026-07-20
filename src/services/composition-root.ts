import { prismaPlotRepository } from "@/database/repositories/prisma-plot.repository";
import { postgisPlotWriteRepository } from "@/database/repositories/postgis-plot-write.repository";
import { postgisPlotGeoJsonSource } from "@/gis/data-sources/postgis-plot-geojson-source";
import { PlotMapService } from "@/services/gis/plot-map.service";
import { PlotService } from "@/services/plots/plot.service";
import { testPlotLookupSource } from "@/modules/plots/data/test-plot-lookup-source";
import { prismaRecommendationRepository } from "@/database/repositories/prisma-recommendation.repository";
import { FirstStageRecommendationService } from "@/services/recommendations/first-stage-recommendation.service";
import { piskentMvpRecommendationScenarioSource } from "@/modules/recommendations/data/piskent-mvp-recommendation-scenarios";
import { MultiStageRecommendationService } from "@/services/recommendations/multi-stage-recommendation.service";

export const plotService = new PlotService(prismaPlotRepository, postgisPlotWriteRepository, testPlotLookupSource);
export const plotMapService = new PlotMapService(postgisPlotGeoJsonSource);
export const firstStageRecommendationService = new FirstStageRecommendationService(prismaPlotRepository, prismaRecommendationRepository);
export const multiStageRecommendationService = new MultiStageRecommendationService(piskentMvpRecommendationScenarioSource);
