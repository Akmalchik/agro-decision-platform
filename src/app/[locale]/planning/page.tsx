import { PlanningWorkspace } from "@/components/planning/planning-workspace";
import { getDictionary, getLocale } from "@/i18n";
export default async function PlanningPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = getLocale((await params).locale);
  return <PlanningWorkspace locale={locale} dictionary={getDictionary(locale)} />;
}
