export function formatNumber(value: number | string, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(Number(value));
}

export function formatDate(value: Date | string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
}
