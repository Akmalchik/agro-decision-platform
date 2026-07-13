import Link from "next/link";
import { PlotDetails } from "@/components/plots/plot-details";
import type { PlotMapProperties } from "@/gis/domain/geometry";

export function MapPlotCard({ plot }: { plot: PlotMapProperties }) {
  return (
    <aside className="border-t border-[var(--border)] bg-white p-6" aria-label="Выбранный участок">
      <h2 className="mb-4 text-xl font-semibold">Выбранный участок</h2>
      <PlotDetails plot={plot} />
      <Link
        className="mt-5 inline-flex rounded-lg bg-[var(--primary)] px-4 py-2.5 font-medium text-white"
        href={`/plot/${plot.plotId}`}
      >
        Подробнее
      </Link>
    </aside>
  );
}
