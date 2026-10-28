import { getDictionary, getLocale } from "@/i18n";
import { getPresentationMessages } from "@/i18n/presentation";
import { ClassicFarmerDemo } from "@/components/presentation/classic-farmer-demo";
import { loadPresentation } from "@/services/presentation.service";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function DemoPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ plotId?: string }> }) {
  const locale = getLocale((await params).locale);
  const query = await searchParams;
  const data = await loadPresentation().catch(() => null);
  if (!data) return <section className="executive-panel"><h1>{getPresentationMessages(locale).farmer}</h1><p role="status">{getPresentationMessages(locale).unavailable}</p></section>;
  return <ClassicFarmerDemo data={data} locale={locale} dictionary={getDictionary(locale)} initialPlotId={typeof query.plotId === "string" ? query.plotId : undefined} />;
}
