import type { Polygon } from "geojson";
import type { MapViewport } from "@/gis/domain/geometry";

export type PlotGeometryMetrics = {
  areaHectares: string;
  center: [latitude: number, longitude: number];
  boundingBox: MapViewport;
};

export type PlotGeometryDetails = PlotGeometryMetrics & {
  geometry: Polygon;
};
