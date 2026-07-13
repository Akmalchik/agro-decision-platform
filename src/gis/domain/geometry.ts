import type { FeatureCollection, Geometry, Polygon } from "geojson";

export type GeoJsonGeometry = Geometry;

export type PlotGeometry = {
  plotId: string;
  geometry: GeoJsonGeometry;
};

export type PlotMapProperties = {
  plotId: string;
  cadastralNumber: string;
  farmName: string;
  area: string;
  bonitet: string | null;
  specialization: string | null;
};

export type PlotFeatureCollection = FeatureCollection<Polygon, PlotMapProperties>;

export type MapViewport = {
  southWest: [latitude: number, longitude: number];
  northEast: [latitude: number, longitude: number];
};

export type PlotMapDataset = {
  featureCollection: PlotFeatureCollection;
  viewport: MapViewport;
  srid: 4326;
};
