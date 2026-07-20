import { intlLocales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { AnalyticsLevel, DistrictAnalytics } from "@/modules/recommendations/domain/district-analytics";
import { formatNumber } from "@/utils/format";

const statusClasses: Record<AnalyticsLevel, string> = {
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-800",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-800",
  HIGH: "border-rose-200 bg-rose-50 text-rose-800",
};

function Progress({ label, value }: { label: string; value: number }) {
  const normalizedValue = Math.max(0, Math.min(100, value));

  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="recommendation-progress h-full rounded-full bg-blue-700"
        style={{ width: `${normalizedValue}%` }}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalizedValue}
      />
    </div>
  );
}

export function DistrictAnalyticsPanel({ analytics, locale, dictionary, showMarketIndicators }: { analytics: DistrictAnalytics; locale: Locale; dictionary: Dictionary; showMarketIndicators: boolean }) {
  const messages = dictionary.districtAnalytics;
  const intlLocale = intlLocales[locale];
  const shortage = Math.max(0, analytics.requiredTons - analytics.currentProduction);
  const shortagePercent = Math.max(0, 100 - analytics.coveragePercent);
  const allocatedPercent = analytics.plannedArea > 0
    ? Math.round((analytics.allocatedArea / analytics.plannedArea) * 100)
    : 0;

  return (
    <section className="border-b border-slate-200 bg-slate-50/70 p-4 sm:p-6 lg:p-8" aria-labelledby="district-analytics-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="district-analytics-title" className="text-lg font-semibold text-slate-950">{messages.title}</h3>
        <p className="text-sm font-medium text-slate-600">{dictionary.recommendation.cropNames[analytics.cropId]}</p>
      </div>

      <div className={`mt-4 grid gap-3 sm:grid-cols-2 ${showMarketIndicators ? "xl:grid-cols-4" : "lg:grid-cols-2"}`}>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{messages.demand}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">{formatNumber(analytics.requiredTons, intlLocale)} {messages.tons}</p>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-slate-500">{messages.currentProduction}</dt><dd className="font-medium tabular-nums text-slate-800">{formatNumber(analytics.currentProduction, intlLocale)} {messages.tons}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">{messages.shortage}</dt><dd className="font-semibold tabular-nums text-rose-700">{formatNumber(shortage, intlLocale)} {messages.tons} · {shortagePercent}%</dd></div>
          </dl>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{messages.coverage}</p>
            <strong className="text-2xl font-semibold tabular-nums text-blue-900">{analytics.coveragePercent}%</strong>
          </div>
          <Progress label={messages.coverage} value={analytics.coveragePercent} />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{messages.allocatedArea}</p>
          <p className="mt-1 font-semibold tabular-nums text-slate-900">{formatNumber(analytics.allocatedArea, intlLocale)} {messages.hectares} / {formatNumber(analytics.plannedArea, intlLocale)} {messages.hectares}</p>
          <Progress label={messages.allocatedArea} value={allocatedPercent} />
        </article>

        {showMarketIndicators ? <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{messages.forecastPrice}</p>
          <p className="mt-2 break-words text-2xl font-semibold tabular-nums text-slate-950">{formatNumber(analytics.forecastPrice, intlLocale)} {messages.priceUnit}</p>
          <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusClasses[analytics.forecastPriceLevel]}`}>
            {messages.levels[analytics.forecastPriceLevel]}
          </span>
        </article> : null}

        {showMarketIndicators ? <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{messages.overproductionRisk}</p>
          <span className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-sm font-bold ${statusClasses[analytics.overproductionRisk]}`}>
            {messages.levels[analytics.overproductionRisk]}
          </span>
        </article> : null}
      </div>
    </section>
  );
}
