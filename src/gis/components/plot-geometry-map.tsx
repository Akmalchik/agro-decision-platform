"use client";

import { GeoJSON, MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import type { PlotGeometryDetails } from "@/gis/domain/plot-geometry-metrics";
import type { Dictionary } from "@/i18n/types";

export function PlotGeometryMap({ details, dictionary }: { details: PlotGeometryDetails; dictionary: Dictionary }) {
  const bounds: [[number, number], [number, number]] = [details.boundingBox.southWest, details.boundingBox.northEast];

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
      <MapContainer bounds={bounds} boundsOptions={{ padding: [36, 36] }} className="h-80 w-full" scrollWheelZoom zoomControl={false}>
        <ZoomControl zoomInTitle={dictionary.map.zoomIn} zoomOutTitle={dictionary.map.zoomOut} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON data={details.geometry} style={{ color: "#174c2a", fillColor: "#3f8f58", fillOpacity: 0.45, weight: 3 }} />
      </MapContainer>
    </div>
  );
}
