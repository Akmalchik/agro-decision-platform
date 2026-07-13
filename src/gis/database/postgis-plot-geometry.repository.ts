import { Prisma } from "@prisma/client";
import { prisma } from "@/database/prisma";
import type { GeoJsonGeometry, PlotGeometry } from "@/gis/domain/geometry";
import type { PlotGeometryRepository } from "@/gis/domain/plot-geometry-repository";

type GeometryRow = {
  plotId: string;
  geometry: GeoJsonGeometry;
};

export const postgisPlotGeometryRepository: PlotGeometryRepository = {
  async findByPlotId(plotId): Promise<PlotGeometry | null> {
    const rows = await prisma.$queryRaw<GeometryRow[]>(Prisma.sql`
      SELECT
        "id" AS "plotId",
        ST_AsGeoJSON("geometry")::jsonb AS "geometry"
      FROM "plots"
      WHERE "id" = ${plotId}::uuid
      LIMIT 1
    `);

    return rows[0] ?? null;
  },
};
