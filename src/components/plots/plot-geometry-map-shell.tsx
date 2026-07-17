"use client";

import dynamic from "next/dynamic";
import type { PlotGeometryDetails } from "@/gis/domain/plot-geometry-metrics";
import type { Dictionary } from "@/i18n/types";

const PlotGeometryMap = dynamic(
  () => import("@/gis/components/plot-geometry-map").then((module) => module.PlotGeometryMap),
  { ssr: false, loading: () => <div className="h-80 animate-pulse rounded-2xl bg-slate-200" aria-hidden="true" /> },
);

export function PlotGeometryMapShell({ details, dictionary }: { details: PlotGeometryDetails; dictionary: Dictionary }) {
  return <div aria-label={dictionary.loading.map}><PlotGeometryMap details={details} dictionary={dictionary} /></div>;
}
