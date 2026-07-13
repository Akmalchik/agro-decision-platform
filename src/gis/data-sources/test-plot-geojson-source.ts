import { TEST_PLOT_GEOMETRY, TEST_PLOT_VIEWPORT } from "@/gis/data/test-plot-geometry";
import { MAP_SRID } from "@/gis/config/map-config";
import type { PlotFeatureCollection } from "@/gis/domain/geometry";
import { plotFeatureCollectionSchema } from "@/gis/schemas/plot-feature-collection.schema";
import type { PlotGeoJsonSource } from "@/gis/data-sources/plot-geojson-source";
import { TEST_PLOT } from "@/modules/plots/data/test-plot";

export const testPlotGeoJsonSource: PlotGeoJsonSource = {
  async load() {
    const featureCollection: PlotFeatureCollection = plotFeatureCollectionSchema.parse({
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        id: TEST_PLOT.id,
        geometry: TEST_PLOT_GEOMETRY,
        properties: {
          plotId: TEST_PLOT.id,
          cadastralNumber: TEST_PLOT.cadastralNumber,
          farmName: TEST_PLOT.farmName,
          area: TEST_PLOT.area,
          bonitet: TEST_PLOT.soilProfile?.bonitet ?? null,
          specialization: TEST_PLOT.specialization,
        },
      }],
    });

    return { featureCollection, viewport: TEST_PLOT_VIEWPORT, srid: MAP_SRID };
  },
};
