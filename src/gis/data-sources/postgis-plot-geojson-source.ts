import { Prisma } from "@prisma/client";
import { prisma } from "@/database/prisma";
import type { PlotMapDataset } from "@/gis/domain/geometry";
import { MAP_SRID } from "@/gis/config/map-config";
import { plotFeatureCollectionSchema } from "@/gis/schemas/plot-feature-collection.schema";
import type { PlotGeoJsonSource } from "@/gis/data-sources/plot-geojson-source";

type PlotMapRow = {
  features: unknown;
  minLatitude: number | null;
  minLongitude: number | null;
  maxLatitude: number | null;
  maxLongitude: number | null;
};

export const postgisPlotGeoJsonSource: PlotGeoJsonSource = {
  async load(): Promise<PlotMapDataset> {
    const [row] = await prisma.$queryRaw<PlotMapRow[]>(Prisma.sql`
      SELECT
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'type', 'Feature',
              'id', p."id",
              'geometry', ST_AsGeoJSON(p."geometry")::jsonb,
              'properties', jsonb_build_object(
                'plotId', p."id",
                'cadastralNumber', p."cadastral_number",
                'farmName', p."farm_name",
                'area', p."area"::text,
                'bonitet', s."bonitet"::text,
                'specialization', p."specialization"
              )
            ) ORDER BY p."created_at"
          ) FILTER (WHERE p."geometry" IS NOT NULL),
          '[]'::jsonb
        ) AS "features",
        ST_YMin(ST_Extent(p."geometry")::box3d)::float8 AS "minLatitude",
        ST_XMin(ST_Extent(p."geometry")::box3d)::float8 AS "minLongitude",
        ST_YMax(ST_Extent(p."geometry")::box3d)::float8 AS "maxLatitude",
        ST_XMax(ST_Extent(p."geometry")::box3d)::float8 AS "maxLongitude"
      FROM "plots" p
      LEFT JOIN "soil_profiles" s ON s."plot_id" = p."id"
    `);

    const featureCollection = plotFeatureCollectionSchema.parse({
      type: "FeatureCollection",
      features: row?.features ?? [],
    });

    const minLatitude = row?.minLatitude ?? null;
    const minLongitude = row?.minLongitude ?? null;
    const maxLatitude = row?.maxLatitude ?? null;
    const maxLongitude = row?.maxLongitude ?? null;
    const hasViewport = minLatitude !== null
      && minLongitude !== null
      && maxLatitude !== null
      && maxLongitude !== null;

    return {
      featureCollection,
      viewport: hasViewport
        ? {
            southWest: [minLatitude, minLongitude],
            northEast: [maxLatitude, maxLongitude],
          }
        : null,
      srid: MAP_SRID,
    };
  },
};
