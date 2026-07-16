import { notFound } from "next/navigation";
import { localeFromPathSegment, type Locale } from "@/i18n/config";
import { uzCyrl } from "@/i18n/dictionaries/uz-cyrl";
import { uzLatn } from "@/i18n/dictionaries/uz-latn";
import { ru } from "@/i18n/dictionaries/ru";
import type { Dictionary } from "@/i18n/types";

const dictionaries: Record<Locale, Dictionary> = { "uz-Latn": uzLatn, "uz-Cyrl": uzCyrl, ru };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function getLocale(segment: string): Locale {
  const locale = localeFromPathSegment(segment);
  if (!locale) notFound();
  return locale;
}
