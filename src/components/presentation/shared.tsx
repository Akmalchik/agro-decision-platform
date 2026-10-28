import type { Locale } from "@/i18n/config";
import { intlLocales } from "@/i18n/config";
import { getPresentationMessages } from "@/i18n/presentation";
import type { Dictionary } from "@/i18n/types";
import type { PresentationData } from "@/modules/presentation/projection";

export function DemoBadge({ locale }: { locale: Locale }) { return <span className="demo-badge"><span aria-hidden="true" />{getPresentationMessages(locale).demo}</span>; }
export function formatMetric(value: number | null, locale: Locale) { return value === null ? getPresentationMessages(locale).unknown : new Intl.NumberFormat(intlLocales[locale], { maximumFractionDigits: 2 }).format(value); }
export function PresentationHero({ locale, demo = false }: { locale: Locale; demo?: boolean }) {
  const m = getPresentationMessages(locale);
  return <div className="presentation-hero">
    <div><p className="presentation-eyebrow">SMART EKIN <span>/</span> {m.region}</p><h1>{demo ? m.farmer : m.dashboard}</h1><p className="presentation-subtitle">{demo ? m.readOnly : m.subtitle}</p></div>
    <div className="hero-status"><span className="public-status"><span aria-hidden="true" />{m.public}</span><DemoBadge locale={locale} /></div>
  </div>;
}
export function CoverageChart({ data, locale }: { data: PresentationData; locale: Locale }) {
  const m = getPresentationMessages(locale);
  const value = Math.max(0, Math.min(100, data.forecast.coverage));
  const circumference = 2 * Math.PI * 55;
  return <section className="executive-panel coverage-panel"><div className="panel-heading"><div><span className="section-number">03</span><h2>{m.coverage}</h2></div><DemoBadge locale={locale} /></div>
    <div className="coverage-content"><div className="coverage-ring" role="img" aria-label={`${m.coverage}: ${formatMetric(value, locale)}%`}>
      <svg viewBox="0 0 140 140" aria-hidden="true"><circle cx="70" cy="70" r="55" fill="none" stroke="#eaf0ed" strokeWidth="10" /><circle cx="70" cy="70" r="55" fill="none" stroke="#147d59" strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value / 100)} transform="rotate(-90 70 70)" /></svg>
      <div><strong>{formatMetric(value, locale)}<small>%</small></strong><span>{m.covered}</span></div>
    </div><dl><div><dt><i className="legend-dot green" />{m.reported}</dt><dd>{formatMetric(data.forecast.coveredArea, locale)} {m.ha}</dd></div><div><dt><i className="legend-dot gray" />{m.unreported}</dt><dd>{formatMetric(data.forecast.unknownArea, locale)} {m.ha}</dd></div></dl></div>
    <p className="panel-note">{m.threshold} {m.unknownLand}</p>
  </section>;
}
export function BalanceChart({ data, locale, dictionary }: { data: PresentationData; locale: Locale; dictionary: Dictionary }) {
  const m = getPresentationMessages(locale);
  const rows = data.forecast.rows.filter((row) => row.area > 0 || row.demand !== null);
  const max = Math.max(1, ...rows.flatMap((row) => [row.production ?? 0, row.demand ?? 0]));
  return <section className="executive-panel balance-panel"><div className="panel-heading"><div><span className="section-number">03</span><h2>{m.cropBalance}</h2></div><DemoBadge locale={locale} /></div>
    <div className="chart-legend"><span><i className="legend-dot green" />{m.production}</span><span><i className="legend-dot pale" />{m.demand}</span><span>{data.season} · {m.tons}</span></div>
    {data.forecast.ready ? <div className="balance-chart">{rows.map((row) => <details key={row.crop} className="balance-row"><summary><span className="chart-crop">{dictionary.recommendation.cropNames[row.crop]}</span><span className="bar-stack"><span className="bar-track"><span className="bar-production" style={{ width: `${(row.production ?? 0) / max * 100}%` }} /></span><span className="bar-track"><span className="bar-demand" style={{ width: `${(row.demand ?? 0) / max * 100}%` }} /></span></span><span className="bar-values"><strong>{formatMetric(row.production, locale)}</strong><span>{formatMetric(row.demand, locale)}</span></span></summary>
      <dl className="chart-expanded"><div><dt>{m.deficit}</dt><dd>{formatMetric(row.deficit, locale)} {m.tons}</dd></div><div><dt>{m.surplus}</dt><dd>{formatMetric(row.surplus, locale)} {m.tons}</dd></div></dl><p className="panel-note">{m.demoYield}. {m.unknownLand}</p>
    </details>)}</div> : <p className="panel-note">{m.waiting}</p>}
    <p className="panel-note">{m.forecast} · {m.pilot}</p>
  </section>;
}
