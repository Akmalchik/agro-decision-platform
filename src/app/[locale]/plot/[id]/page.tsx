import Link from "next/link";
import { notFound } from "next/navigation";
import { PlotDetails } from "@/components/plots/plot-details";
import { PlotGeometryMapShell } from "@/components/plots/plot-geometry-map-shell";
import { FirstStageRecommendations } from "@/components/recommendations/first-stage-recommendations";
import { MultiStageRecommendations } from "@/components/recommendations/multi-stage-recommendations";
import { DataState } from "@/components/ui/data-state";
import { PageHeader } from "@/components/ui/page-header";
import { localePathSegments } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n";
import { multiStageRecommendationService, plotService } from "@/services/composition-root";

type PlotPageProps = { params: Promise<{ locale: string; id: string }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PlotPage({ params }: PlotPageProps) {
  const { locale: segment, id } = await params;
  const locale = getLocale(segment);
  const dictionary = getDictionary(locale);
  const mapHref = `/${localePathSegments[locale]}/map`;
  let plot;
  let geometry;

  try {
    [plot, geometry] = await Promise.all([plotService.getById(id), plotService.getGeometryById(id)]);
  } catch (error) {
    console.warn(`Unable to load plot ${id}.`, error);
    return (
      <div className="space-y-6">
        <PageHeader title={dictionary.plot.title} description={`${dictionary.plot.identifier}: ${id}`} />
        <DataState title={dictionary.databaseError.plotTitle} description={dictionary.databaseError.plotDescription} />
        <Link className="inline-block font-medium text-[var(--primary)]" href={mapHref}>← {dictionary.buttons.backToMap}</Link>
      </div>
    );
  }

  if (!plot || !geometry) notFound();
  const multiStageRecommendation = multiStageRecommendationService.getForCadastralNumber(plot.cadastralNumber);

  return (
    <div className="space-y-6">
      <PageHeader title={dictionary.plot.title} description={plot.farmName} />
      <PlotGeometryMapShell details={geometry} dictionary={dictionary} />
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <PlotDetails
          locale={locale}
          dictionary={dictionary}
          plot={{
            cadastralNumber: plot.cadastralNumber,
            farmName: plot.farmName,
            area: plot.area,
            bonitet: plot.soilProfile?.bonitet ?? null,
            specialization: plot.specialization,
            taxId: plot.taxId,
            waterSupply: plot.waterSupply,
            previousCrop: plot.previousCrop,
          }}
        />
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <Link className="font-medium text-[var(--primary)]" href={mapHref}>← {dictionary.buttons.backToMap}</Link>
        </div>
      </section>
      {multiStageRecommendation
        ? <MultiStageRecommendations result={multiStageRecommendation} dictionary={dictionary} />
        : <FirstStageRecommendations plotId={id} locale={locale} dictionary={dictionary} />}
    </div>
  );
}
