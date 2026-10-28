import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { localePathSegments, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { getPlanningMessages } from "@/i18n/planning";
import { getPresentationMessages } from "@/i18n/presentation";

export function AppHeader({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const prefix = `/${localePathSegments[locale]}`;
  const navigation = [
    { href: prefix, label: getPresentationMessages(locale).overview },
    { href: `${prefix}/demo`, label: getPresentationMessages(locale).farmer },
    { href: `${prefix}/map`, label: dictionary.navigation.map },
    { href: `${prefix}/planning`, label: getPlanningMessages(locale).title },
  ];
  return (
    <header className="app-header border-b border-[var(--border)] bg-white">
      <div className="mx-auto flex min-h-20 max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link className="brand-lockup" href={prefix}><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span><strong>SMART EKIN</strong><small>AGRO DECISION PLATFORM</small></span></Link>
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
