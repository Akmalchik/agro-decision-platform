import Link from "next/link";
import { notFound } from "next/navigation";
import { PlotDetails } from "@/components/plots/plot-details";
import { DataState } from "@/components/ui/data-state";
import { PageHeader } from "@/components/ui/page-header";
import { localePathSegments } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n";
import { plotService } from "@/services/composition-root";

type PlotPageProps = { params: Promise<{ locale: string; id: string }> };

export default async function PlotPage({ params }: PlotPageProps) {
  const { locale: segment, id } = await params;
  const locale = getLocale(segment);
  const dictionary = getDictionary(locale);
  const mapHref = `/${localePathSegments[locale]}/map`;
  let plot;

  try {
    plot = await plotService.getById(id);
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

  if (!plot) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={dictionary.plot.title} description={plot.farmName} />
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
          }}
        />
        <Link className="mt-5 inline-block font-medium text-[var(--primary)]" href={mapHref}>← {dictionary.buttons.backToMap}</Link>
      </section>
    </div>
  );
}
