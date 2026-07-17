"use client";

import type { Feature, Polygon } from "geojson";
import { Path } from "leaflet";
import type { Layer, LeafletMouseEvent, PathOptions } from "leaflet";
import { useCallback, useRef, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { MapPlotCard } from "@/components/map/map-plot-card";
import { PlotCreationForm } from "@/components/map/plot-creation-form";
import { PlotDrawingControl } from "@/gis/components/plot-drawing-control";
import { DEFAULT_MAP_BOUNDS } from "@/gis/config/map-config";
import type { PlotMapDataset, PlotMapProperties } from "@/gis/domain/geometry";
import type { PlotGeometryMetrics } from "@/gis/domain/plot-geometry-metrics";
import { plotMapPropertiesSchema } from "@/gis/schemas/plot-feature-collection.schema";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

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

export function PlotMap({ dataset, locale, dictionary }: { dataset: PlotMapDataset; locale: Locale; dictionary: Dictionary }) {
  const [selectedPlot, setSelectedPlot] = useState<PlotMapProperties | null>(null);
  const [draftGeometry, setDraftGeometry] = useState<Polygon | null>(null);
  const [metrics, setMetrics] = useState<PlotGeometryMetrics | null>(null);
  const [geometryError, setGeometryError] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [startToken, setStartToken] = useState(0);
  const [resetToken, setResetToken] = useState(0);
  const requestSequence = useRef(0);
  const { featureCollection, viewport } = dataset;
  const bounds: [[number, number], [number, number]] = viewport
    ? [viewport.southWest, viewport.northEast]
    : DEFAULT_MAP_BOUNDS;

  const clearDraft = useCallback(() => {
    requestSequence.current += 1;
    setDraftGeometry(null);
    setMetrics(null);
    setGeometryError(false);
    setIsCalculating(false);
  }, []);

  const inspectGeometry = useCallback(async (geometry: Polygon) => {
    const sequence = ++requestSequence.current;
    setDraftGeometry(geometry);
    setMetrics(null);
    setGeometryError(false);
    setIsCalculating(true);

    try {
      const response = await fetch("/api/plots/geometry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geometry),
      });
      const result = await response.json() as { data?: PlotGeometryMetrics };
      if (!response.ok || !result.data) throw new Error("INVALID_GEOMETRY");
      if (sequence === requestSequence.current) setMetrics(result.data);
    } catch {
      if (sequence === requestSequence.current) setGeometryError(true);
    } finally {
      if (sequence === requestSequence.current) setIsCalculating(false);
    }
  }, []);

  const cancelCreation = () => {
    clearDraft();
    setResetToken((value) => value + 1);
  };

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
    layer.options.pmIgnore = true;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-4 border-b border-[var(--border)] p-4">
        <button
          className="rounded-lg bg-[var(--primary)] px-4 py-2.5 font-medium text-white"
          type="button"
          onClick={() => setStartToken((value) => value + 1)}
        >
          {dictionary.creation.createPlot}
        </button>
        <p className="text-sm text-slate-600">{dictionary.creation.drawingHint}</p>
      </div>
      <MapContainer bounds={bounds} boundsOptions={{ padding: [32, 32] }} className="h-[560px] w-full" scrollWheelZoom zoomControl={false}>
        <ZoomControl zoomInTitle={dictionary.map.zoomIn} zoomOutTitle={dictionary.map.zoomOut} />
        <PlotDrawingControl
          startToken={startToken}
          resetToken={resetToken}
          dictionary={dictionary}
          onGeometryChange={inspectGeometry}
          onRemove={clearDraft}
        />
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
      {isCalculating ? <p className="border-t border-[var(--border)] p-4 text-sm text-slate-600" role="status">{dictionary.creation.calculating}</p> : null}
      {geometryError ? <p className="border-t border-[var(--border)] p-4 text-sm text-red-700" role="alert">{dictionary.creation.invalidGeometry}</p> : null}
      {draftGeometry && metrics ? <PlotCreationForm geometry={draftGeometry} metrics={metrics} locale={locale} dictionary={dictionary} onCancel={cancelCreation} /> : null}
      {selectedPlot ? <MapPlotCard plot={selectedPlot} locale={locale} dictionary={dictionary} /> : null}
    </div>
  );
}
