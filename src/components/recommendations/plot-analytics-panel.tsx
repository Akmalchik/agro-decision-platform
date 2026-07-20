import { intlLocales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { PlotAnalytics } from "@/modules/recommendations/domain/plot-analytics";
import { formatNumber } from "@/utils/format";

const indicators = [
  { key: "bonitet", icon: "◉" },
  { key: "water", icon: "💧" },
  { key: "previousCrop", icon: "🌾" },
  { key: "area", icon: "▱" },
  { key: "rotation", icon: "↻" },
] as const;

export function PlotAnalyticsPanel({ analytics, locale, dictionary }: { analytics: PlotAnalytics; locale: Locale; dictionary: Dictionary }) {
  const messages = dictionary.plotAnalytics;
  const values = {
    bonitet: `${formatNumber(analytics.bonitet, intlLocales[locale])} ${dictionary.units.points}`,
    water: messages.waterAssessments[analytics.waterAssessment],
    previousCrop: messages.previousCrops[analytics.previousCrop],
    area: `${formatNumber(analytics.plotArea, intlLocales[locale])} ${dictionary.units.hectare}`,
    rotation: messages.rotationAssessments[analytics.rotationAssessment],
  };

  return (
    <section className="border-b border-slate-200 bg-slate-50/70 p-4 sm:p-6 lg:p-8" aria-labelledby="plot-analytics-title">
      <h3 id="plot-analytics-title" className="text-lg font-semibold text-slate-950">{messages.title}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {indicators.map(({ key, icon }) => (
          <article key={key} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-lg text-emerald-800" aria-hidden="true">{icon}</span>
              <p className="min-w-0 text-xs font-semibold uppercase tracking-[0.07em] text-slate-500">{messages.labels[key]}</p>
            </div>
            <p className="mt-3 break-words text-lg font-semibold text-slate-950">{values[key]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
