import { Prisma } from "@prisma/client";
import { prisma } from "@/database/prisma";
import type { MapViewport } from "@/gis/domain/geometry";
export async function presentationPlotDetails(ids: string[]) {
  if (!ids.length) return { details: new Map<string, { bonitet: string | null; waterSupply: string | null; previousCrop: string | null; bounds: MapViewport | null }>(), viewport: null };
  const rows = await prisma.$queryRaw<Array<{ id: string; bonitet: string | null; waterSupply: string | null; previousCrop: string | null; south: number | null; west: number | null; north: number | null; east: number | null; allSouth: number | null; allWest: number | null; allNorth: number | null; allEast: number | null }>>(Prisma.sql`
    SELECT p.id, s.bonitet::text AS bonitet, p.water_supply AS "waterSupply", p.previous_crop AS "previousCrop",
      ST_YMin(ST_Envelope(p.geometry)::box3d)::float8 AS south, ST_XMin(ST_Envelope(p.geometry)::box3d)::float8 AS west,
      ST_YMax(ST_Envelope(p.geometry)::box3d)::float8 AS north, ST_XMax(ST_Envelope(p.geometry)::box3d)::float8 AS east,
      ST_YMin((ST_Extent(p.geometry) OVER ())::box3d)::float8 AS "allSouth", ST_XMin((ST_Extent(p.geometry) OVER ())::box3d)::float8 AS "allWest",
      ST_YMax((ST_Extent(p.geometry) OVER ())::box3d)::float8 AS "allNorth", ST_XMax((ST_Extent(p.geometry) OVER ())::box3d)::float8 AS "allEast"
    FROM plots p LEFT JOIN soil_profiles s ON s.plot_id = p.id WHERE p.id IN (${Prisma.join(ids.map((id) => Prisma.sql`${id}::uuid`))})
  `);
  const first = rows[0];
  const viewport: MapViewport | null = first && first.allSouth !== null && first.allWest !== null && first.allNorth !== null && first.allEast !== null ? { southWest: [first.allSouth, first.allWest], northEast: [first.allNorth, first.allEast] } : null;
  return { viewport, details: new Map(rows.map((row) => [row.id, { bonitet: row.bonitet, waterSupply: row.waterSupply, previousCrop: row.previousCrop,
    bounds: row.south !== null && row.west !== null && row.north !== null && row.east !== null ? { southWest: [row.south, row.west], northEast: [row.north, row.east] } as MapViewport : null }])) };
}
