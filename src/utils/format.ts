export function formatArea(area: number | string): string {
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(Number(area))} га`;
}
