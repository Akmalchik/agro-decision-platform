"use client";

import type { Feature, Polygon } from "geojson";
import { Path } from "leaflet";
import type { Layer, LeafletMouseEvent, PathOptions } from "leaflet";
import { useState } from "react";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import { MapPlotCard } from "@/components/map/map-plot-card";
import type { PlotMapDataset, PlotMapProperties } from "@/gis/domain/geometry";
import { plotMapPropertiesSchema } from "@/gis/schemas/plot-feature-collection.schema";

const DEFAULT_STYLE: PathOptions = {
  color: "#246b3c",
  fillColor: "#3f8f58",
  fillOpacity: 0.42,
  weight: 2,
};

const HOVER_STYLE: PathOptions = {
  color: "#174c2a",
  fillColor: "#55a96c",
  fillOpacity: 0.62,
  weight: 3,
};

const SELECTED_STYLE: PathOptions = {
  color: "#123d22",
  fillColor: "#2e7d46",
  fillOpacity: 0.7,
  weight: 4,
};

export function PlotMap({ dataset }: { dataset: PlotMapDataset }) {
  const [selectedPlot, setSelectedPlot] = useState<PlotMapProperties | null>(null);
  const { featureCollection, viewport } = dataset;

  if (!viewport) return null;

  const bounds: [[number, number], [number, number]] = [viewport.southWest, viewport.northEast];

  const isPlotFeature = (feature: Feature): feature is Feature<Polygon, PlotMapProperties> =>
    feature.geometry.type === "Polygon" && plotMapPropertiesSchema.safeParse(feature.properties).success;

  const styleFeature = (feature?: Feature): PathOptions =>
    feature && isPlotFeature(feature) && feature.properties.plotId === selectedPlot?.plotId
      ? SELECTED_STYLE
      : DEFAULT_STYLE;

  const attachInteraction = (feature: Feature, layer: Layer) => {
    if (!isPlotFeature(feature) || !(layer instanceof Path)) return;

    layer.on({
      mouseover: (event: LeafletMouseEvent) => event.target.setStyle(HOVER_STYLE),
      mouseout: (event: LeafletMouseEvent) => {
        const style = feature.properties.plotId === selectedPlot?.plotId ? SELECTED_STYLE : DEFAULT_STYLE;
        event.target.setStyle(style);
      },
      click: (event: LeafletMouseEvent) => {
        setSelectedPlot(feature.properties);
        event.target.setStyle(SELECTED_STYLE);
      },
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
      <MapContainer bounds={bounds} boundsOptions={{ padding: [32, 32] }} className="h-[560px] w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          key={selectedPlot?.plotId ?? "unselected"}
          data={featureCollection}
          style={styleFeature}
          onEachFeature={attachInteraction}
        />
      </MapContainer>
      {selectedPlot ? <MapPlotCard plot={selectedPlot} /> : null}
    </div>
  );
}
