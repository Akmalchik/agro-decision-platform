import type { Dictionary } from "@/i18n/types";
import type { MultiStageRecommendationService } from "@/services/recommendations/multi-stage-recommendation.service";

type RecommendationResult = NonNullable<ReturnType<MultiStageRecommendationService["getForCadastralNumber"]>>;

export function MultiStageRecommendations({ result, dictionary }: { result: RecommendationResult; dictionary: Dictionary }) {
  const messages = dictionary.multiStageRecommendation;

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm sm:p-6 lg:p-8" aria-labelledby="ai-recommendation-title">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">{messages.stage}: {messages.stages[result.stage]}</p>
          <h2 id="ai-recommendation-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{messages.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{messages.descriptions[result.stage]}</p>
        </div>
        {result.districtCropDistributionPercent !== undefined ? (
          <div className="min-w-52 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">{messages.districtDistribution}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums text-blue-950">{result.districtCropDistributionPercent}%</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">
              <div className="h-full rounded-full bg-blue-700" style={{ width: `${result.districtCropDistributionPercent}%` }} role="progressbar" aria-label={messages.districtDistribution} aria-valuemin={0} aria-valuemax={100} aria-valuenow={result.districtCropDistributionPercent} />
            </div>
          </div>
        ) : null}
      </div>

      <h3 className="mt-6 text-sm font-bold uppercase tracking-[0.12em] text-slate-500">{messages.topThree}</h3>
      <div className="mt-4 grid gap-5 lg:grid-cols-3">
        {result.recommendations.map((recommendation) => (
          <article key={recommendation.cropCode} className={`recommendation-card rounded-2xl border bg-white p-5 ${recommendation.rank === 1 ? "border-emerald-300 shadow-md" : "border-slate-200 shadow-sm"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">#{recommendation.rank}</span>
                <h4 className="mt-3 text-xl font-semibold text-slate-950">{dictionary.recommendation.cropNames[recommendation.cropCode]}</h4>
              </div>
              <strong className="text-3xl font-semibold tabular-nums text-emerald-800">{recommendation.score}%</strong>
            </div>
            <p className="mt-1 text-right text-xs text-slate-500">{dictionary.recommendation.score}</p>

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
    </section>
  );
}
