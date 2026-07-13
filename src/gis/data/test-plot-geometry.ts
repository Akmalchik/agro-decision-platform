import type { Polygon } from "geojson";
import type { MapViewport } from "@/gis/domain/geometry";

export const TEST_PLOT_GEOMETRY: Polygon = {
  type: "Polygon",
  coordinates: [[
    [69.1917, 41.1728],
    [69.1984, 41.1741],
    [69.2049, 41.1715],
    [69.2072, 41.1668],
    [69.2021, 41.1629],
    [69.1946, 41.1636],
    [69.1898, 41.1681],
    [69.1917, 41.1728],
  ]],
};

export const TEST_PLOT_VIEWPORT: MapViewport = {
  southWest: [41.1629, 69.1898],
  northEast: [41.1741, 69.2072],
};
