"use client";

import dynamic from "next/dynamic";
import type { PlotMapDataset } from "@/gis/domain/geometry";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

const PlotMap = dynamic(() => import("@/gis/components/plot-map").then((module) => module.PlotMap), {
  ssr: false,
  loading: () => <div className="h-[560px] animate-pulse rounded-2xl bg-slate-200" aria-hidden="true" />,
});

export function MapShell({ dataset, locale, dictionary }: { dataset: PlotMapDataset; locale: Locale; dictionary: Dictionary }) {
  return (
    <div aria-label={dictionary.loading.map}>
      <PlotMap dataset={dataset} locale={locale} dictionary={dictionary} />
    </div>
  );
}
