import { ExecutiveDashboard } from "@/components/presentation/executive-dashboard";
import { loadPresentation } from "@/services/presentation.service";
import { getDictionary, getLocale } from "@/i18n";
import { getPresentationMessages } from "@/i18n/presentation";
export const dynamic = "force-dynamic";
export default async function PilotOverview({params}:{params:Promise<{locale:string}>}){
  const locale=getLocale((await params).locale);
  const data=await loadPresentation().catch(()=>null);
  return data ? <ExecutiveDashboard data={data} locale={locale} dictionary={getDictionary(locale)}/> : <p>{getPresentationMessages(locale).unavailable}</p>;
}
