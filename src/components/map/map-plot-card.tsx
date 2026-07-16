import Link from "next/link";
import { PlotDetails } from "@/components/plots/plot-details";
import type { PlotMapProperties } from "@/gis/domain/geometry";
import { localePathSegments, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

export function MapPlotCard({ plot, locale, dictionary }: { plot: PlotMapProperties; locale: Locale; dictionary: Dictionary }) {
  return (
    <aside className="border-t border-[var(--border)] bg-white p-6" aria-label={dictionary.map.selectedPlot}>
      <h2 className="mb-4 text-xl font-semibold">{dictionary.map.selectedPlot}</h2>
      <PlotDetails plot={plot} locale={locale} dictionary={dictionary} />
      <Link
        className="mt-5 inline-flex rounded-lg bg-[var(--primary)] px-4 py-2.5 font-medium text-white"
        href={`/${localePathSegments[locale]}/plot/${plot.plotId}`}
      >
        {dictionary.buttons.details}
      </Link>
    </aside>
  );
}
