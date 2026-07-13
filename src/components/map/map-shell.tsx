"use client";

import dynamic from "next/dynamic";
import type { PlotMapDataset } from "@/gis/domain/geometry";

const PlotMap = dynamic(() => import("@/gis/components/plot-map").then((module) => module.PlotMap), {
  ssr: false,
  loading: () => <div className="h-[560px] animate-pulse rounded-2xl bg-slate-200" aria-label="Загрузка карты" />,
});

export function MapShell({ dataset }: { dataset: PlotMapDataset }) {
  return <PlotMap dataset={dataset} />;
}
