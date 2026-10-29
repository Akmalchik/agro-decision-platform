import { getDictionary, getLocale } from "@/i18n";
import { getPresentationMessages } from "@/i18n/presentation";
import { FarmerStory } from "@/components/presentation/farmer-story";
import { loadPresentation } from "@/services/presentation.service";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function DemoPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = getLocale((await params).locale);
  const data = await loadPresentation().catch(() => null);
  if (!data) return <section className="executive-panel"><h1>{getPresentationMessages(locale).farmer}</h1><p role="status">{getPresentationMessages(locale).unavailable}</p></section>;
  return <FarmerStory data={data} locale={locale} dictionary={getDictionary(locale)} />;
}
