"use client";
import { useEffect } from "react";
import { GeoJSON, MapContainer, TileLayer, ZoomControl, useMap } from "react-leaflet";
import type { Layer } from "leaflet";
import type { Feature } from "geojson";
import type { MapViewport, PlotMapDataset, PlotMapProperties } from "@/gis/domain/geometry";
import type { Dictionary } from "@/i18n/types";
import { DEFAULT_MAP_BOUNDS } from "@/gis/config/map-config";

function Focus({ bounds }: { bounds: MapViewport | null }) {
  const map = useMap();
  useEffect(() => { if (bounds) map.fitBounds([bounds.southWest, bounds.northEast], { padding: [42, 42], maxZoom: 15, animate: false }); }, [bounds, map]);
  return null;
}
export function PresentationMap({ dataset, selectedId, bounds, onSelect, dictionary }: {
  dataset: PlotMapDataset; selectedId: string; bounds: MapViewport | null; onSelect: (id: string) => void; dictionary: Dictionary;
}) {
  const initial = dataset.viewport ? [dataset.viewport.southWest, dataset.viewport.northEast] as [[number, number], [number, number]] : DEFAULT_MAP_BOUNDS;
  function bind(feature: Feature, layer: Layer) {
    const properties = feature.properties as PlotMapProperties;
    const label = document.createElement("span");
    label.textContent = `${properties.farmName} · ${properties.cadastralNumber}`;
    layer.bindTooltip(label, { sticky: true });
    layer.on("click", () => onSelect(properties.plotId));
  }
  return <MapContainer bounds={initial} boundsOptions={{ padding: [30, 30] }} className="presentation-map" scrollWheelZoom={false} zoomControl={false}>
    <ZoomControl position="bottomright" zoomInTitle={dictionary.map.zoomIn} zoomOutTitle={dictionary.map.zoomOut} />
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <GeoJSON key={selectedId} data={dataset.featureCollection} onEachFeature={bind} style={(feature) => ({ color: feature?.properties.plotId === selectedId ? "#075e45" : "#4c8870", fillColor: feature?.properties.plotId === selectedId ? "#17a36d" : "#8fc0a5", fillOpacity: feature?.properties.plotId === selectedId ? 0.65 : 0.28, weight: feature?.properties.plotId === selectedId ? 3 : 1.7 })} />
    <Focus bounds={bounds ?? dataset.viewport} />
  </MapContainer>;
}
