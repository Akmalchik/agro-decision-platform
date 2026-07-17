"use client";

import "@geoman-io/leaflet-geoman-free";
import type { Layer } from "leaflet";
import type { Polygon } from "geojson";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type { Dictionary } from "@/i18n/types";

type GeoJsonLayer = Layer & { toGeoJSON: () => { geometry: unknown } };

type PlotDrawingControlProps = {
  startToken: number;
  resetToken: number;
  dictionary: Dictionary;
  onGeometryChange: (geometry: Polygon) => void;
  onRemove: () => void;
};

function polygonFromLayer(layer: Layer): Polygon | null {
  if (!("toGeoJSON" in layer)) return null;
  const geometry = (layer as GeoJsonLayer).toGeoJSON().geometry;
  return geometry && typeof geometry === "object" && "type" in geometry && geometry.type === "Polygon"
    ? geometry as Polygon
    : null;
}

export function PlotDrawingControl({ startToken, resetToken, dictionary, onGeometryChange, onRemove }: PlotDrawingControlProps) {
  const map = useMap();
  const draftLayer = useRef<Layer | null>(null);

  useEffect(() => {
    map.pm.setLang("en", {
      tooltips: { finishPoly: dictionary.creation.finishPolygon },
      actions: {
        finish: dictionary.creation.finishPolygon,
        cancel: dictionary.creation.cancel,
        removeLastVertex: dictionary.creation.removeVertex,
      },
      buttonTitles: {
        editButton: dictionary.creation.editPolygon,
        deleteButton: dictionary.creation.deletePolygon,
      },
    }, "en");
    map.pm.addControls({
      position: "topleft",
      drawControls: true,
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawPolygon: true,
      drawCircle: false,
      drawText: false,
      editControls: true,
      editMode: true,
      removalMode: true,
      dragMode: false,
      cutPolygon: false,
      rotateMode: false,
    });
    map.pm.setGlobalOptions({ allowSelfIntersection: false });

    const emitGeometry = (layer: Layer) => {
      const geometry = polygonFromLayer(layer);
      if (geometry) onGeometryChange(geometry);
    };

    const handleCreate = (event: { layer: Layer }) => {
      map.pm.disableDraw();
      if (draftLayer.current && map.hasLayer(draftLayer.current)) map.removeLayer(draftLayer.current);
      draftLayer.current = event.layer;
      event.layer.on("pm:update", () => emitGeometry(event.layer));
      event.layer.on("pm:remove", () => {
        draftLayer.current = null;
        onRemove();
      });
      emitGeometry(event.layer);
    };

    map.on("pm:create", handleCreate);
    return () => {
      map.off("pm:create", handleCreate);
      map.pm.removeControls();
    };
  }, [dictionary, map, onGeometryChange, onRemove]);

  useEffect(() => {
    if (startToken === 0) return;
    if (draftLayer.current && map.hasLayer(draftLayer.current)) map.removeLayer(draftLayer.current);
    draftLayer.current = null;
    onRemove();
    map.pm.enableDraw("Polygon", { allowSelfIntersection: false });
  }, [map, onRemove, startToken]);

  useEffect(() => {
    if (resetToken === 0) return;
    map.pm.disableDraw();
    if (draftLayer.current && map.hasLayer(draftLayer.current)) map.removeLayer(draftLayer.current);
    draftLayer.current = null;
  }, [map, resetToken]);

  return null;
}
