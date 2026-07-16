export const locales = ["uz-Latn", "uz-Cyrl", "ru"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "uz-Latn";
export const localeCookieName = "smart-ekin-locale";

export const localePathSegments: Record<Locale, string> = {
  "uz-Latn": "uz-latn",
  "uz-Cyrl": "uz-cyrl",
  ru: "ru",
};

export const intlLocales: Record<Locale, string> = {
  "uz-Latn": "uz-Latn-UZ",
  "uz-Cyrl": "uz-Cyrl-UZ",
  ru: "ru-RU",
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localeFromPathSegment(segment: string): Locale | null {
  return locales.find((locale) => localePathSegments[locale] === segment.toLowerCase()) ?? null;
}
