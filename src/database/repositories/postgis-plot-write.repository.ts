import { Prisma } from "@prisma/client";
import type { Polygon } from "geojson";
import { prisma } from "@/database/prisma";
import type { PlotGeometryDetails, PlotGeometryMetrics } from "@/gis/domain/plot-geometry-metrics";
import type { CreatePlotInput, PlotWriteRepository } from "@/modules/plots/domain/plot-write-repository";

type GeometryMetricsRow = {
  areaHectares: string;
  centerLatitude: number;
  centerLongitude: number;
  minLatitude: number;
  minLongitude: number;
  maxLatitude: number;
  maxLongitude: number;
};

type PlotGeometryRow = GeometryMetricsRow & { geometry: unknown };

function toMetrics(row: GeometryMetricsRow): PlotGeometryMetrics {
  return {
    areaHectares: row.areaHectares,
    center: [row.centerLatitude, row.centerLongitude],
    boundingBox: {
      southWest: [row.minLatitude, row.minLongitude],
      northEast: [row.maxLatitude, row.maxLongitude],
    },
  };
}

const geometrySql = (geometryJson: string) => Prisma.sql`
  SELECT
    ROUND((ST_Area(g::geography) / 10000)::numeric, 2)::text AS "areaHectares",
    ST_Y(ST_Centroid(g))::float8 AS "centerLatitude",
    ST_X(ST_Centroid(g))::float8 AS "centerLongitude",
    ST_YMin(ST_Envelope(g)::box3d)::float8 AS "minLatitude",
    ST_XMin(ST_Envelope(g)::box3d)::float8 AS "minLongitude",
    ST_YMax(ST_Envelope(g)::box3d)::float8 AS "maxLatitude",
    ST_XMax(ST_Envelope(g)::box3d)::float8 AS "maxLongitude"
  FROM (
    SELECT ST_SetSRID(ST_GeomFromGeoJSON(${geometryJson}::json), 4326) AS g
  ) geometry
  WHERE ST_IsValid(g) AND NOT ST_IsEmpty(g)
`;

export const postgisPlotWriteRepository: PlotWriteRepository = {
  async inspectGeometry(geometry: Polygon): Promise<PlotGeometryMetrics | null> {
    const [row] = await prisma.$queryRaw<GeometryMetricsRow[]>(geometrySql(JSON.stringify(geometry)));
    return row ? toMetrics(row) : null;
  },

  async findGeometryById(id: string): Promise<PlotGeometryDetails | null> {
    const [row] = await prisma.$queryRaw<PlotGeometryRow[]>(Prisma.sql`
      SELECT
        ST_AsGeoJSON("geometry")::jsonb AS "geometry",
        ROUND((ST_Area("geometry"::geography) / 10000)::numeric, 2)::text AS "areaHectares",
        ST_Y(ST_Centroid("geometry"))::float8 AS "centerLatitude",
        ST_X(ST_Centroid("geometry"))::float8 AS "centerLongitude",
        ST_YMin(ST_Envelope("geometry")::box3d)::float8 AS "minLatitude",
        ST_XMin(ST_Envelope("geometry")::box3d)::float8 AS "minLongitude",
        ST_YMax(ST_Envelope("geometry")::box3d)::float8 AS "maxLatitude",
        ST_XMax(ST_Envelope("geometry")::box3d)::float8 AS "maxLongitude"
      FROM "plots"
      WHERE "id" = ${id}::uuid
    `);

    return row ? { ...toMetrics(row), geometry: row.geometry as Polygon } : null;
  },

  async create(input: CreatePlotInput): Promise<string> {
    const id = crypto.randomUUID();
    const geometryJson = JSON.stringify(input.geometry);

    return prisma.$transaction(async (transaction) => {
      const [created] = await transaction.$queryRaw<{ id: string }[]>(Prisma.sql`
        INSERT INTO "plots" (
          "id", "cadastral_number", "farm_name", "owner", "area", "geometry",
          "tax_id", "water_supply", "previous_crop"
        )
        SELECT
          ${id}::uuid,
          ${input.cadastralNumber},
          ${input.farmName},
          'self-service',
          ROUND((ST_Area(g::geography) / 10000)::numeric, 2),
          g,
          ${input.taxId},
          ${input.waterSupply},
          ${input.previousCrop}
        FROM (
          SELECT ST_SetSRID(ST_GeomFromGeoJSON(${geometryJson}::json), 4326) AS g
        ) geometry
        WHERE ST_IsValid(g) AND NOT ST_IsEmpty(g)
        RETURNING "id"
      `);

      if (!created) throw new Error("INVALID_GEOMETRY");

      await transaction.$executeRaw(Prisma.sql`
        INSERT INTO "soil_profiles" ("id", "plot_id", "bonitet")
        VALUES (${crypto.randomUUID()}::uuid, ${id}::uuid, ${input.bonitet}::numeric)
      `);

      return id;
    });
  },
};
