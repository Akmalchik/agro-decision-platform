import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { localePathSegments, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { getPlanningMessages } from "@/i18n/planning";

export function AppHeader({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const prefix = `/${localePathSegments[locale]}`;
  const navigation = [
    { href: prefix, label: dictionary.navigation.home },
    { href: `${prefix}/map`, label: dictionary.navigation.map },
    { href: `${prefix}/planning`, label: getPlanningMessages(locale).title },
  ];
  return (
    <header className="border-b border-[var(--border)] bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link className="font-semibold text-[var(--primary)]" href={prefix}>Smart Ekin</Link>
        <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-6">
          <nav aria-label={dictionary.navigation.ariaLabel}>
            <ul className="flex flex-wrap gap-3 sm:gap-6">
              {navigation.map((item) => <li key={item.href}><Link className="text-sm font-medium hover:text-[var(--primary)]" href={item.href}>{item.label}</Link></li>)}
            </ul>
          </nav>
          <LanguageSwitcher locale={locale} labels={dictionary.languageNames} ariaLabel={dictionary.navigation.language} />
        </div>
      </div>
    </header>
  );
}
