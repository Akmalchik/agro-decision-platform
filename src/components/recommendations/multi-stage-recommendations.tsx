import type { Dictionary } from "@/i18n/types";
import type { Locale } from "@/i18n/config";
import type { DistrictAnalytics } from "@/modules/recommendations/domain/district-analytics";
import type { PlotAnalytics } from "@/modules/recommendations/domain/plot-analytics";
import type { MultiStageRecommendationService } from "@/services/recommendations/multi-stage-recommendation.service";
import { DistrictAnalyticsPanel } from "@/components/recommendations/district-analytics-panel";
import { PlotAnalyticsPanel } from "@/components/recommendations/plot-analytics-panel";

type RecommendationResult = NonNullable<ReturnType<MultiStageRecommendationService["getForCadastralNumber"]>>;

const stageBadgeClasses = {
  FIRST_STAGE: "border-emerald-200 bg-emerald-50 text-emerald-800",
  THIRD_STAGE: "border-amber-200 bg-amber-50 text-amber-800",
  FOURTH_STAGE: "border-blue-200 bg-blue-50 text-blue-800",
} as const;

const rankMedals = ["🥇", "🥈", "🥉"] as const;

export function MultiStageRecommendations({ result, plotAnalytics, districtAnalytics, locale, dictionary }: { result: RecommendationResult; plotAnalytics: PlotAnalytics | null; districtAnalytics: DistrictAnalytics | null; locale: Locale; dictionary: Dictionary }) {
  const messages = dictionary.multiStageRecommendation;
  const stageProgress = result.stage === "FOURTH_STAGE" ? 100 : result.districtCropDistributionPercent ?? 0;
  const stageProgressLabel = result.stage === "FOURTH_STAGE" ? messages.analysisCompleteness : messages.districtDistribution;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/80 shadow-sm" aria-labelledby="ai-recommendation-title">
      <div className="border-b border-slate-200 bg-white/70 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 id="ai-recommendation-title" className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-950">
              <span aria-hidden="true">🌱</span>
              <span>{messages.title}</span>
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">{messages.stage}</span>
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${stageBadgeClasses[result.stage]}`}>
                {messages.stages[result.stage]}
              </span>
            </div>
          </div>
          {result.stage !== "FIRST_STAGE" ? (
            <div className="w-full shrink-0 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 sm:w-60">
              <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 text-sm font-medium leading-5 text-blue-900">{stageProgressLabel}</p>
                <p className="shrink-0 text-2xl font-semibold tabular-nums text-blue-950">{stageProgress}%</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">
                <div className="recommendation-progress h-full rounded-full bg-blue-700" style={{ width: `${stageProgress}%` }} role="progressbar" aria-label={stageProgressLabel} aria-valuemin={0} aria-valuemax={100} aria-valuenow={stageProgress} />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {plotAnalytics ? <PlotAnalyticsPanel analytics={plotAnalytics} locale={locale} dictionary={dictionary} /> : null}
      {result.stage !== "FIRST_STAGE" && districtAnalytics
        ? <DistrictAnalyticsPanel analytics={districtAnalytics} locale={locale} dictionary={dictionary} showMarketIndicators={result.stage === "FOURTH_STAGE"} />
        : null}

      <div className="p-4 sm:p-6 lg:p-8">
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">{messages.topThree}</h3>
        <div className="mt-4 grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {result.recommendations.map((recommendation) => (
            <article key={recommendation.cropCode} className={`recommendation-card min-w-0 rounded-2xl border bg-white p-4 sm:p-5 ${recommendation.rank === 1 ? "border-emerald-300 shadow-md" : "border-slate-200 shadow-sm"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-2xl" role="img" aria-label={`#${recommendation.rank}`}>{rankMedals[recommendation.rank - 1]}</span>
                  <h4 className="mt-2 break-words text-xl font-semibold text-slate-950">{dictionary.recommendation.cropNames[recommendation.cropCode]}</h4>
                </div>
                <div className="shrink-0 text-right">
                  <strong className="block text-3xl font-semibold tabular-nums text-emerald-800">{recommendation.score}</strong>
                  <span className="text-xs font-medium text-slate-500">{messages.scoreUnit}</span>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{messages.reasons}</p>
                <ul className="mt-3 space-y-2.5">
                  {recommendation.reasonKeys.map((key) => (
                    <li key={key} className="flex gap-2.5 text-sm leading-5 text-slate-700">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800" aria-hidden="true">✓</span>
                      <span>{messages.reasonKeys[key]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
