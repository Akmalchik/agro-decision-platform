"use client";

import { useMemo, useState } from "react";
import { intlLocales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { AnalyticsLevel, DistrictAnalytics } from "@/modules/recommendations/domain/district-analytics";
import type { CropCode } from "@/modules/recommendations/domain/first-stage-recommendation";
import type { PlotAnalytics } from "@/modules/recommendations/domain/plot-analytics";
import type { MultiStageRecommendationService } from "@/services/recommendations/multi-stage-recommendation.service";
import { formatNumber } from "@/utils/format";
import { DistrictAnalyticsPanel } from "@/components/recommendations/district-analytics-panel";
import { PlotAnalyticsPanel } from "@/components/recommendations/plot-analytics-panel";

type RecommendationResult = NonNullable<ReturnType<MultiStageRecommendationService["getForCadastralNumber"]>>;
type RecommendationItem = RecommendationResult["recommendations"][number];

const stageBadgeClasses = {
  FIRST_STAGE: "border-emerald-200 bg-emerald-50 text-emerald-800",
  THIRD_STAGE: "border-amber-200 bg-amber-50 text-amber-800",
  FOURTH_STAGE: "border-blue-200 bg-blue-50 text-blue-800",
} as const;

const statusClasses: Record<AnalyticsLevel, string> = {
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-800",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-800",
  HIGH: "border-rose-200 bg-rose-50 text-rose-800",
};

const rankMedals = ["🥇", "🥈", "🥉"] as const;

function buildWhyTitle(template: string, cropName: string) {
  return template.replace("{crop}", cropName);
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-baseline justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
      <dt className="min-w-0 text-sm text-slate-500">{label}</dt>
      <dd className="shrink-0 text-right text-sm font-semibold tabular-nums text-slate-900">{value}</dd>
    </div>
  );
}

function ExplanationPanel({
  recommendation,
  plotAnalytics,
  districtAnalytics,
  locale,
  dictionary,
  showDistrictMetrics,
  showMarketMetrics,
}: {
  recommendation: RecommendationItem;
  plotAnalytics: PlotAnalytics | null;
  districtAnalytics: DistrictAnalytics | null;
  locale: Locale;
  dictionary: Dictionary;
  showDistrictMetrics: boolean;
  showMarketMetrics: boolean;
}) {
  const messages = dictionary.multiStageRecommendation;
  const districtMessages = dictionary.districtAnalytics;
  const plotMessages = dictionary.plotAnalytics;
  const cropName = dictionary.recommendation.cropNames[recommendation.cropCode];
  const intlLocale = intlLocales[locale];
  const shortage = districtAnalytics
    ? Math.max(0, districtAnalytics.requiredTons - districtAnalytics.currentProduction)
    : 0;
  const shortagePercent = districtAnalytics
    ? Math.max(0, 100 - districtAnalytics.coveragePercent)
    : 0;

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-live="polite">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{messages.reasons}</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-950">{buildWhyTitle(messages.whyRecommended, cropName)}</h3>
        </div>
        <div className="w-fit rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
          <span className="block text-xs font-semibold">{messages.finalScore}</span>
          <strong className="text-2xl font-semibold tabular-nums">{recommendation.score}</strong>
          <span className="ml-1 text-sm font-medium">{messages.scoreUnit}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 p-4">
          <h4 className="text-sm font-semibold text-slate-950">{messages.reasons}</h4>
          <ul className="mt-3 space-y-2.5">
            {recommendation.reasonKeys.map((key) => (
              <li key={key} className="flex gap-2.5 text-sm leading-5 text-slate-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800" aria-hidden="true">✓</span>
                <span>{messages.reasonKeys[key]}</span>
              </li>
            ))}
          </ul>
        </article>

        {plotAnalytics ? (
          <article className="rounded-2xl border border-slate-200 p-4">
            <h4 className="text-sm font-semibold text-slate-950">{messages.keyMetrics}</h4>
            <dl className="mt-3 space-y-2">
              <MetricRow label={plotMessages.labels.bonitet} value={`${formatNumber(plotAnalytics.bonitet, intlLocale)} ${dictionary.units.points}`} />
              <MetricRow label={plotMessages.labels.water} value={plotMessages.waterAssessments[plotAnalytics.waterAssessment]} />
              <MetricRow label={plotMessages.labels.previousCrop} value={plotMessages.previousCrops[plotAnalytics.previousCrop]} />
              <MetricRow label={plotMessages.labels.area} value={`${formatNumber(plotAnalytics.plotArea, intlLocale)} ${dictionary.units.hectare}`} />
              <MetricRow label={plotMessages.labels.rotation} value={plotMessages.rotationAssessments[plotAnalytics.rotationAssessment]} />
            </dl>
          </article>
        ) : null}

        {showDistrictMetrics ? (
          <article className="rounded-2xl border border-slate-200 p-4">
            <h4 className="text-sm font-semibold text-slate-950">{showMarketMetrics ? messages.marketMetrics : messages.districtMetrics}</h4>
            {districtAnalytics ? (
              <dl className="mt-3 space-y-2">
                <MetricRow label={districtMessages.demand} value={`${formatNumber(districtAnalytics.requiredTons, intlLocale)} ${districtMessages.tons}`} />
                <MetricRow label={districtMessages.currentProduction} value={`${formatNumber(districtAnalytics.currentProduction, intlLocale)} ${districtMessages.tons}`} />
                <MetricRow label={districtMessages.shortage} value={`${formatNumber(shortage, intlLocale)} ${districtMessages.tons} · ${shortagePercent}%`} />
                <MetricRow label={districtMessages.coverage} value={`${districtAnalytics.coveragePercent}%`} />
                <MetricRow label={districtMessages.allocatedArea} value={`${formatNumber(districtAnalytics.allocatedArea, intlLocale)} / ${formatNumber(districtAnalytics.plannedArea, intlLocale)} ${districtMessages.hectares}`} />
                {showMarketMetrics ? (
                  <>
                    <MetricRow label={districtMessages.forecastPrice} value={`${formatNumber(districtAnalytics.forecastPrice, intlLocale)} ${districtMessages.priceUnit}`} />
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusClasses[districtAnalytics.forecastPriceLevel]}`}>{districtMessages.levels[districtAnalytics.forecastPriceLevel]}</span>
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusClasses[districtAnalytics.overproductionRisk]}`}>{districtMessages.overproductionRisk}: {districtMessages.levels[districtAnalytics.overproductionRisk]}</span>
                    </div>
                  </>
                ) : null}
              </dl>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-600">{messages.noDistrictAnalytics}</p>
            )}
          </article>
        ) : null}
      </div>
    </section>
  );
}

export function MultiStageRecommendations({
  result,
  plotAnalytics,
  districtAnalytics,
  locale,
  dictionary,
}: {
  result: RecommendationResult;
  plotAnalytics: PlotAnalytics | null;
  districtAnalytics: DistrictAnalytics[];
  locale: Locale;
  dictionary: Dictionary;
}) {
  const messages = dictionary.multiStageRecommendation;
  const [selectedCrop, setSelectedCrop] = useState<CropCode>(result.recommendations[0]?.cropCode);
  const stageProgress = result.stage === "FOURTH_STAGE" ? 100 : result.districtCropDistributionPercent ?? 0;
  const stageProgressLabel = result.stage === "FOURTH_STAGE" ? messages.analysisCompleteness : messages.districtDistribution;
  const analyticsByCrop = useMemo(
    () => new Map(districtAnalytics.map((analytics) => [analytics.cropId, analytics])),
    [districtAnalytics],
  );
  const selectedRecommendation = result.recommendations.find((recommendation) => recommendation.cropCode === selectedCrop) ?? result.recommendations[0];
  const selectedDistrictAnalytics = selectedRecommendation ? analyticsByCrop.get(selectedRecommendation.cropCode) ?? null : null;

  if (!selectedRecommendation) return null;

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
      {result.stage !== "FIRST_STAGE" && selectedDistrictAnalytics
        ? <DistrictAnalyticsPanel analytics={selectedDistrictAnalytics} locale={locale} dictionary={dictionary} showMarketIndicators={result.stage === "FOURTH_STAGE"} />
        : null}

      <div className="p-4 sm:p-6 lg:p-8">
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">{messages.topThree}</h3>
        <div className="mt-4 grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {result.recommendations.map((recommendation) => {
            const cropName = dictionary.recommendation.cropNames[recommendation.cropCode];
            const isSelected = recommendation.cropCode === selectedRecommendation.cropCode;

            return (
              <button
                key={recommendation.cropCode}
                type="button"
                className={`recommendation-card min-w-0 rounded-2xl border p-4 text-left outline-none transition sm:p-5 ${isSelected ? "border-emerald-400 bg-emerald-50/70 shadow-md ring-2 ring-emerald-100" : "border-slate-200 bg-white shadow-sm hover:border-emerald-200 hover:bg-slate-50 focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-200"}`}
                aria-pressed={isSelected}
                aria-label={messages.selectCrop.replace("{crop}", cropName)}
                onClick={() => setSelectedCrop(recommendation.cropCode)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-2xl" role="img" aria-label={`#${recommendation.rank}`}>{rankMedals[recommendation.rank - 1]}</span>
                    <h4 className="mt-2 break-words text-xl font-semibold text-slate-950">{cropName}</h4>
                  </div>
                  <div className="shrink-0 text-right">
                    <strong className="block text-3xl font-semibold tabular-nums text-emerald-800">{recommendation.score}</strong>
                    <span className="text-xs font-medium text-slate-500">{messages.scoreUnit}</span>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{messages.reasons}</p>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                        <span className="h-2 w-2 rounded-full bg-emerald-600" aria-hidden="true" />
                        {messages.selectedCrop}
                      </span>
                    ) : null}
                  </div>
                  <ul className="mt-3 space-y-2.5">
                    {recommendation.reasonKeys.slice(0, 4).map((key) => (
                      <li key={key} className="flex gap-2.5 text-sm leading-5 text-slate-700">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800" aria-hidden="true">✓</span>
                        <span>{messages.reasonKeys[key]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            );
          })}
        </div>

        <ExplanationPanel
          recommendation={selectedRecommendation}
          plotAnalytics={plotAnalytics}
          districtAnalytics={selectedDistrictAnalytics}
          locale={locale}
          dictionary={dictionary}
          showDistrictMetrics={result.stage !== "FIRST_STAGE"}
          showMarketMetrics={result.stage === "FOURTH_STAGE"}
        />
      </div>
    </section>
  );
}
