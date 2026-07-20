import type { Dictionary } from "@/i18n/types";
import type { ConfidenceLevel, RecommendationConfidence } from "@/modules/recommendations/domain/recommendation-confidence";

const circumference = 2 * Math.PI * 50;

const colors: Record<ConfidenceLevel, { ring: string; badge: string; dot: string }> = {
  LOW: { ring: "stroke-rose-600", badge: "border-rose-200 bg-rose-50 text-rose-800", dot: "bg-rose-500" },
  MEDIUM: { ring: "stroke-amber-500", badge: "border-amber-200 bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  HIGH: { ring: "stroke-emerald-600", badge: "border-emerald-200 bg-emerald-50 text-emerald-800", dot: "bg-emerald-500" },
};

export function AiConfidenceCard({ confidence, dictionary }: { confidence: RecommendationConfidence; dictionary: Dictionary }) {
  const messages = dictionary.aiConfidence;
  const value = Math.max(0, Math.min(100, confidence.value));
  const color = colors[confidence.level];
  const dashOffset = circumference * (1 - value / 100);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm" aria-labelledby="ai-confidence-title">
      <div className="grid items-center gap-5 p-5 sm:grid-cols-[auto_1fr] sm:p-6 lg:p-7">
        <div className="mx-auto text-center sm:mx-0">
          <div className="relative h-36 w-36" role="img" aria-label={`${messages.title}: ${value}%`}>
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
              <circle className="fill-none stroke-slate-100" cx="60" cy="60" r="50" strokeWidth="9" />
              <circle
                className={`fill-none transition-[stroke-dashoffset] duration-700 ${color.ring}`}
                cx="60"
                cy="60"
                r="50"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <strong className="absolute inset-0 flex items-center justify-center text-3xl font-semibold tabular-nums text-slate-950">{value}%</strong>
          </div>
          <span className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${color.badge}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${color.dot}`} aria-hidden="true" />
            {messages.levels[confidence.level]}
          </span>
        </div>

        <div className="min-w-0 text-center sm:text-left">
          <h2 id="ai-confidence-title" className="text-2xl font-semibold tracking-tight text-slate-950">
            <span aria-hidden="true">🤖 </span>{messages.title}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{messages.caption}</p>
        </div>
      </div>
    </section>
  );
}
