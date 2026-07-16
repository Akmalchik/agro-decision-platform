import type { FeatureCollection, Polygon } from "geojson";

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
  viewport: MapViewport | null;
  srid: 4326;
};
