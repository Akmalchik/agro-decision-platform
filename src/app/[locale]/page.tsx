import { getDictionary, getLocale } from "@/i18n";
import { ExecutiveDashboard } from "@/components/presentation/executive-dashboard";
import { loadPresentation } from "@/services/presentation.service";
import { getPresentationMessages } from "@/i18n/presentation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = getLocale((await params).locale);
  const dictionary = getDictionary(locale);

  const data = await loadPresentation().catch(() => null);
  if (!data) return <section className="executive-panel"><h1>{getPresentationMessages(locale).dashboard}</h1><p role="status">{getPresentationMessages(locale).unavailable}</p></section>;
  return <ExecutiveDashboard data={data} locale={locale} dictionary={dictionary} />;
}
