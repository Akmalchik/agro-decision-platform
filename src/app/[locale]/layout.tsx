import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/app-header";
import { LocaleDocument } from "@/components/layout/locale-document";
import { locales, localePathSegments } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n";

type LocaleLayoutProps = Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale: localePathSegments[locale] }));
}

export async function generateMetadata({ params }: Pick<LocaleLayoutProps, "params">): Promise<Metadata> {
  const locale = getLocale((await params).locale);
  const dictionary = getDictionary(locale);
  return { title: dictionary.metadata.title, description: dictionary.metadata.description };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const locale = getLocale((await params).locale);
  const dictionary = getDictionary(locale);

  return (
    <>
      <LocaleDocument locale={locale} />
      <AppHeader locale={locale} dictionary={dictionary} />
      <main className="mx-auto min-h-[calc(100vh-65px)] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </>
  );
}
