"use client";

import { useState } from "react";
import { intlLocales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { FirstStageRecommendationResult } from "@/modules/recommendations/domain/first-stage-recommendation";
import type { ApiResponse } from "@/types/api";

type Props = { plotId: string; locale: Locale; dictionary: Dictionary };

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
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm" aria-labelledby="recommendation-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="recommendation-title" className="text-xl font-semibold text-slate-900">{messages.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">{messages.description}</p>
        </div>
        <button
          className="rounded-lg bg-[var(--primary)] px-4 py-2.5 font-medium text-white disabled:cursor-wait disabled:opacity-60"
          type="button"
          onClick={calculate}
          disabled={isLoading}
        >
          {isLoading ? messages.calculating : messages.calculate}
        </button>
      </div>

      {errorCode ? <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{errorMessage}</p> : null}

      {result ? (
        <div className="mt-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {result.items.map((item) => (
              <article key={item.cropCode} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--primary)]">TOP {item.rank}</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900">{messages.cropNames[item.cropCode]}</h3>
                    <p className="mt-1 text-sm text-slate-600">{messages.statuses[item.status]}</p>
                  </div>
                  <div className="rounded-lg bg-white px-3 py-2 text-center shadow-sm">
                    <strong className="block text-xl text-slate-900">{item.finalScore}</strong>
                    <span className="text-xs text-slate-500">{messages.score}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-800">{messages.components}</p>
                  <dl className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-white p-2"><dt className="text-slate-500">{messages.bonitet}</dt><dd className="mt-1 font-semibold">{item.bonitetScore}</dd></div>
                    <div className="rounded-lg bg-white p-2"><dt className="text-slate-500">{messages.water}</dt><dd className="mt-1 font-semibold">{item.waterScore}</dd></div>
                    <div className="rounded-lg bg-white p-2"><dt className="text-slate-500">{messages.rotation}</dt><dd className="mt-1 font-semibold">{item.rotationScore}</dd></div>
                  </dl>
                </div>

                <div className="mt-4 text-sm">
                  <p className="font-medium text-slate-800">{messages.reasons}</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-600">
                    {item.reasonKeys.map((key) => <li key={key}>{messages.reasonsByKey[key]}</li>)}
                  </ul>
                </div>

                {item.warningKeys.length > 0 ? (
                  <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                    <p className="font-medium">{messages.warnings}</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5">
                      {item.warningKeys.map((key) => <li key={key}>{messages.warningsByKey[key]}</li>)}
                    </ul>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            {messages.calculatedAt}: {new Intl.DateTimeFormat(intlLocales[locale], { dateStyle: "medium", timeStyle: "short" }).format(new Date(result.calculatedAt))}
            {" · "}{messages.algorithmVersion}: {result.algorithmVersion}
          </p>
        </div>
      ) : null}
    </section>
  );
}
