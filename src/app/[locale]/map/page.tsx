import { RegionalBreadcrumb } from "@/components/regional/regional-breadcrumb";
import { regionalContext } from "@/modules/regional/demo";
import { MapShell } from "@/components/map/map-shell";
import { DataState } from "@/components/ui/data-state";
import { PageHeader } from "@/components/ui/page-header";
import { getDictionary, getLocale } from "@/i18n";
import { plotMapService } from "@/services/composition-root";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function MapPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ from?: string; product?: string }> }) {
  const query = await searchParams;
  const contextQuery = query.from === "toshkent" ? regionalContext(query.product) : undefined;
  const locale = getLocale((await params).locale);
  const dictionary = getDictionary(locale);
  let dataset;

  try {
    dataset = await plotMapService.getDataset();
  } catch (error) {
    console.warn("Unable to load plots from PostGIS.", error);
    return (
      <div className="space-y-6">
        <RegionalBreadcrumb contextQuery={contextQuery} product={query.product} />
        <PageHeader title={dictionary.map.title} description={dictionary.map.description} />
        <DataState title={dictionary.databaseError.mapTitle} description={dictionary.databaseError.mapDescription} />
      </div>
    );
  }

  if (!dataset.viewport || dataset.featureCollection.features.length === 0) {
    return (
      <div className="space-y-6">
        <RegionalBreadcrumb contextQuery={contextQuery} product={query.product} />
        <PageHeader title={dictionary.map.title} description={dictionary.map.description} />
        <DataState title={dictionary.empty.title} description={dictionary.empty.description} />
        <MapShell dataset={dataset} locale={locale} dictionary={dictionary} contextQuery={contextQuery} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RegionalBreadcrumb contextQuery={contextQuery} product={query.product} />
        <PageHeader title={dictionary.map.title} description={dictionary.map.databaseDescription} />
      <MapShell dataset={dataset} locale={locale} dictionary={dictionary} contextQuery={contextQuery} />
    </div>
  );
}
