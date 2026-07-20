"use client";

import { useState } from "react";
import { intlLocales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { FirstStageRecommendationItem, FirstStageRecommendationResult } from "@/modules/recommendations/domain/first-stage-recommendation";
import type { ApiResponse } from "@/types/api";

type Props = { plotId: string; locale: Locale; dictionary: Dictionary };

function ScoreBar({ label, value, prominent = false }: { label: string; value: number; prominent?: boolean }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className={prominent ? "text-sm font-semibold text-slate-800" : "text-xs font-medium text-slate-600"}>{label}</span>
        <span className={prominent ? "text-sm font-bold text-slate-900" : "text-xs font-semibold text-slate-700"}>{value}%</span>
      </div>
      <div className={prominent ? "h-2.5 overflow-hidden rounded-full bg-emerald-100" : "h-2 overflow-hidden rounded-full bg-slate-200"}>
        <div
          className={`recommendation-progress h-full rounded-full ${prominent ? "bg-emerald-600" : "bg-slate-600"}`}
          style={{ width: `${value}%` }}
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
        />
      </div>
    </div>
  );
}

function RecommendationCard({ item, messages }: { item: FirstStageRecommendationItem; messages: Dictionary["recommendation"] }) {
  const isPrimary = item.rank === 1;

  return (
    <article
      className={`recommendation-card relative overflow-hidden rounded-2xl border bg-white ${
        isPrimary
          ? "border-emerald-300 p-6 shadow-[0_16px_45px_-24px_rgba(15,118,73,0.5)] md:p-7 lg:col-span-2"
          : "border-slate-200 p-5 shadow-sm"
      }`}
      style={{ animationDelay: `${(item.rank - 1) * 90}ms` }}
    >
      {isPrimary ? <div className="absolute inset-x-0 top-0 h-1 bg-emerald-600" aria-hidden="true" /> : null}

      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-wide ${isPrimary ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
            #{item.rank}
          </span>
          <h3 className={`mt-3 font-semibold tracking-tight text-slate-950 ${isPrimary ? "text-2xl md:text-3xl" : "text-xl"}`}>
            {messages.cropNames[item.cropCode]}
          </h3>
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-600">
            <span className={`h-2 w-2 rounded-full ${item.status === "RECOMMENDED" ? "bg-emerald-600" : "bg-slate-500"}`} aria-hidden="true" />
            {messages.statuses[item.status]}
          </p>
        </div>

        <div className={`shrink-0 text-right ${isPrimary ? "min-w-28" : "min-w-24"}`}>
          <strong className={`block font-semibold tabular-nums tracking-tight text-emerald-800 ${isPrimary ? "text-5xl md:text-6xl" : "text-4xl"}`}>
            {item.finalScore}%
          </strong>
          <span className="mt-1 block text-xs font-medium leading-tight text-slate-500">{messages.score}</span>
        </div>
      </div>

      <div className={`mt-6 grid gap-4 ${isPrimary ? "sm:grid-cols-3" : ""}`} aria-label={messages.components}>
        <ScoreBar label={messages.bonitet} value={item.bonitetScore} prominent={isPrimary} />
        <ScoreBar label={messages.water} value={item.waterScore} prominent={isPrimary} />
        <ScoreBar label={messages.rotation} value={item.rotationScore} prominent={isPrimary} />
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{messages.reasons}</h4>
        <ul className="mt-3 space-y-2.5">
          {item.reasonKeys.map((key) => (
            <li key={key} className="flex gap-2.5 text-sm leading-5 text-slate-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800" aria-hidden="true">✓</span>
              <span>{messages.reasonsByKey[key]}</span>
            </li>
          ))}
        </ul>
      </div>

      {item.warningKeys.length > 0 ? (
        <aside className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
          <h4 className="flex items-center gap-2 text-sm font-semibold"><span aria-hidden="true">!</span>{messages.attention}</h4>
          <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-5">
            {item.warningKeys.map((key) => <li className="list-disc" key={key}>{messages.warningsByKey[key]}</li>)}
          </ul>
        </aside>
      ) : null}
    </article>
  );
}

function RecommendationSkeleton({ label }: { label: string }) {
  return (
    <div className="mt-6" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="grid gap-5 lg:grid-cols-2">
        {[0, 1, 2].map((item) => (
          <div key={item} className={`recommendation-skeleton rounded-2xl border border-slate-200 bg-white p-6 ${item === 0 ? "min-h-80 lg:col-span-2" : "min-h-72"}`} aria-hidden="true">
            <div className="h-6 w-14 rounded-full bg-slate-200" />
            <div className="mt-5 h-8 w-2/5 rounded bg-slate-200" />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((bar) => <div key={bar}><div className="h-3 w-20 rounded bg-slate-200" /><div className="mt-3 h-2 rounded-full bg-slate-200" /></div>)}
            </div>
            <div className="mt-8 h-4 w-4/5 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-3/5 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FirstStageRecommendations({ plotId, locale, dictionary }: Props) {
  const [result, setResult] = useState<FirstStageRecommendationResult | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messages = dictionary.recommendation;

  async function calculate() {
    setIsLoading(true);
    setErrorCode(null);

    try {
      const response = await fetch("/api/recommendations/first-stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plotId }),
      });
      const payload = await response.json() as ApiResponse<FirstStageRecommendationResult>;

      if (!response.ok || payload.error) {
        setErrorCode(payload.error?.code ?? "CALCULATION_FAILED");
        return;
      }

      setResult(payload.data);
    } catch {
      setErrorCode("CALCULATION_FAILED");
    } finally {
      setIsLoading(false);
    }
  }

  const errorMessage = errorCode && errorCode in messages.errors
    ? messages.errors[errorCode as keyof typeof messages.errors]
    : messages.errors.CALCULATION_FAILED;

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm sm:p-6 lg:p-8" aria-labelledby="recommendation-title">
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="recommendation-title" className="text-2xl font-semibold tracking-tight text-slate-950">{messages.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{messages.description}</p>
        </div>
        <button
          className="min-h-11 shrink-0 rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-emerald-700 disabled:cursor-wait disabled:opacity-65"
          type="button"
          onClick={calculate}
          disabled={isLoading}
          aria-busy={isLoading}
          aria-controls="recommendation-results"
        >
          {isLoading ? messages.calculating : messages.calculate}
        </button>
      </div>

      {errorCode ? <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{errorMessage}</p> : null}
      {isLoading ? <RecommendationSkeleton label={messages.calculating} /> : null}

      {!isLoading && result ? (
        <div id="recommendation-results" className="mt-6" aria-live="polite">
          <div className="grid items-start gap-5 lg:grid-cols-2">
            {result.items.map((item) => <RecommendationCard key={item.cropCode} item={item} messages={messages} />)}
          </div>

          <aside className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-950 sm:flex sm:items-start sm:gap-4">
            <span className="mb-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-800 sm:mb-0" aria-hidden="true">i</span>
            <div><p className="font-semibold">{messages.conclusion}</p><p className="mt-1 text-blue-900">{messages.finalDecision}</p></div>
          </aside>

          <p className="mt-4 text-xs text-slate-500">
            {messages.calculatedAt}: {new Intl.DateTimeFormat(intlLocales[locale], { dateStyle: "medium", timeStyle: "short" }).format(new Date(result.calculatedAt))}
            {" · "}{messages.algorithmVersion}: {result.algorithmVersion}
          </p>
        </div>
      ) : null}
    </section>
  );
}
