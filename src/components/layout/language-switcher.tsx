"use client";

import { usePathname, useRouter } from "next/navigation";
import { localeCookieName, localePathSegments, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type LanguageSwitcherProps = {
  locale: Locale;
  labels: Dictionary["languageNames"];
  ariaLabel: string;
};

export function LanguageSwitcher({ locale, labels, ariaLabel }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  const changeLocale = (nextLocale: Locale) => {
    document.cookie = `${localeCookieName}=${encodeURIComponent(nextLocale)}; Path=/; Max-Age=31536000; SameSite=Lax`;
    const segments = pathname.split("/");
    segments[1] = localePathSegments[nextLocale];
    router.push(segments.join("/") || `/${localePathSegments[nextLocale]}`);
  };

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">{ariaLabel}</span>
      <select
        aria-label={ariaLabel}
        className="max-w-28 rounded-md border border-[var(--border)] bg-white px-2 py-1.5 text-sm sm:max-w-none"
        value={locale}
        onChange={(event) => changeLocale(event.target.value as Locale)}
      >
        {locales.map((item) => <option key={item} value={item}>{labels[item]}</option>)}
      </select>
    </label>
  );
}
