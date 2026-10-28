import { getDictionary, getLocale } from "@/i18n";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { localePathSegments } from "@/i18n/config";
import { getPresentationMessages } from "@/i18n/presentation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = getLocale((await params).locale);
  const dictionary = getDictionary(locale);

  const prefix = `/${localePathSegments[locale]}`;
  const m = getPresentationMessages(locale);
  return <div className="space-y-8">
    <PageHeader eyebrow={dictionary.home.eyebrow} title={dictionary.home.title} description={dictionary.home.description} />
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{dictionary.home.mapTitle}</h2><p className="mt-2 max-w-2xl text-slate-600">{dictionary.home.mapDescription}</p>
      <div className="mt-5 flex flex-wrap gap-3"><Link className="inline-flex rounded-lg bg-[var(--primary)] px-4 py-2.5 font-medium text-white" href={`${prefix}/map`}>{dictionary.home.openMap}</Link><Link className="inline-flex rounded-lg border border-[var(--border)] px-4 py-2.5 font-medium text-[var(--primary)]" href={`${prefix}/demo`}>{m.farmer}</Link></div>
    </section>
    <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold">Toshkent viloyati — SMART EKIN</h2><p className="mt-2 text-sm text-amber-800">DEMO · {m.noOfficial}</p><Link className="mt-4 inline-block font-medium text-[var(--primary)]" href="/toshkent">Toshkent viloyati DEMO →</Link></section>
  </div>;
}
