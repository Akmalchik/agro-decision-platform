"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { defaultLocale, localeFromPathSegment, localePathSegments } from "@/i18n/config";
import { getDictionary } from "@/i18n";

export default function LocalizedNotFound() {
  const params = useParams<{ locale?: string }>();
  const locale = localeFromPathSegment(params.locale ?? "") ?? defaultLocale;
  const dictionary = getDictionary(locale);

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <h1 className="text-3xl font-bold tracking-tight">{dictionary.notFound.title}</h1>
      <p className="mt-3 text-slate-600">{dictionary.notFound.description}</p>
      <Link className="mt-5 inline-block font-medium text-[var(--primary)]" href={`/${localePathSegments[locale]}`}>
        {dictionary.notFound.backHome}
      </Link>
    </section>
  );
}
