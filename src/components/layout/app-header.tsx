import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { localePathSegments, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

export function AppHeader({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const prefix = `/${localePathSegments[locale]}`;
  const navigation = [
    { href: prefix, label: dictionary.navigation.home },
    { href: `${prefix}/map`, label: dictionary.navigation.map },
  ];
  return (
    <header className="border-b border-[var(--border)] bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="font-semibold text-[var(--primary)]" href={prefix}>Smart Ekin</Link>
        <div className="flex items-center gap-3 sm:gap-6">
          <nav aria-label={dictionary.navigation.ariaLabel}>
            <ul className="flex gap-3 sm:gap-6">
              {navigation.map((item) => <li key={item.href}><Link className="text-sm font-medium hover:text-[var(--primary)]" href={item.href}>{item.label}</Link></li>)}
            </ul>
          </nav>
          <LanguageSwitcher locale={locale} labels={dictionary.languageNames} ariaLabel={dictionary.navigation.language} />
        </div>
      </div>
    </header>
  );
}
