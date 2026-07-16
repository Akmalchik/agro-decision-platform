import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { localePathSegments } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = getLocale((await params).locale);
  const dictionary = getDictionary(locale);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={dictionary.home.eyebrow} title={dictionary.home.title} description={dictionary.home.description} />
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <h2 className="text-xl font-semibold">{dictionary.home.mapTitle}</h2>
        <p className="mt-2 max-w-2xl text-slate-600">{dictionary.home.mapDescription}</p>
        <Link className="mt-5 inline-flex rounded-lg bg-[var(--primary)] px-4 py-2.5 font-medium text-white" href={`/${localePathSegments[locale]}/map`}>
          {dictionary.home.openMap}
        </Link>
      </section>
    </div>
  );
}
