"use client";
import { useState } from "react";
import Link from "next/link";
import { intlLocales, localePathSegments, type Locale } from "@/i18n/config";
import { getPresentationMessages } from "@/i18n/presentation";
import type { Dictionary } from "@/i18n/types";
import { projectStage, type PresentationData, type PresentationStage } from "@/modules/presentation/projection";
import { PresentationMapPanel } from "./map-panel";
import { DemoBadge, PresentationHero, formatMetric } from "./shared";

export function FarmerDemo({ data, locale, dictionary, initialPlotId }: { data: PresentationData; locale: Locale; dictionary: Dictionary; initialPlotId?: string }) {
  const m = getPresentationMessages(locale);
  const prefix = `/${localePathSegments[locale]}`;
  const [selectedId, setSelectedId] = useState(initialPlotId && data.plots.some((plot) => plot.id === initialPlotId) ? initialPlotId : data.plots.find((plot) => plot.bounds)?.id ?? data.plots[0]?.id ?? "");
  const [stage, setStage] = useState<PresentationStage>(1);
  const [cropCode, setCropCode] = useState("");
  const plot = data.plots.find((item) => item.id === selectedId) ?? data.plots[0];
  if (!plot) return <p>{m.unavailable}</p>;
  const result = projectStage(plot.scenario, stage);
  const selected = result.recommendations.find((item) => item.cropCode === cropCode) ?? result.recommendations[0];
  const balance = data.forecast.rows.find((row) => row.crop === selected?.cropCode);
  const farms = [...new Map(data.plots.map((item) => [item.farmId, item.farmName])).entries()];
  const phaseLabels = { 1: m.stage1, 3: m.stage3, 4: m.stage4 };
  const conditions = plot.scenario.inputs.plot;
  const status = stage === 1 ? m.suitability : data.forecast.ready ? m.forecast : m.waiting;
  const phaseDescription = stage === 1 ? m.base : stage === 3 ? data.forecast.ready ? m.districtAdded : m.waiting : m.logisticsAdded;
  return <div className="presentation-page">
    <PresentationHero locale={locale} demo />
    <div className="demo-controls executive-panel"><label className="presentation-label">{m.selectFarm}<select className="presentation-select" value={plot.farmId} onChange={(event) => { const choices = data.plots.filter((item) => item.farmId === event.target.value); setSelectedId((choices.find((item) => item.bounds) ?? choices[0]).id); }}>{farms.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><label className="presentation-label">{m.selectPlot}<select className="presentation-select" value={plot.id} onChange={(event) => setSelectedId(event.target.value)}>{data.plots.filter((item) => item.farmId === plot.farmId).map((item) => <option key={item.id} value={item.id}>{item.cadastralNumber} · {formatMetric(item.area, locale)} {m.ha}</option>)}</select></label><Link className="subtle-link" href={`${prefix}/plot/${plot.id}`}>{m.details} ↗</Link></div>
    <nav className="stage-navigation" aria-label={m.stage}>
      <button aria-pressed={stage === 1} className={stage === 1 ? "active" : ""} onClick={() => setStage(1)}><span>01</span><div><small>{m.stage} 1</small><strong>{m.stage1}</strong></div></button>
      <Link href={`${prefix}/planning`}><span>02</span><div><small>{m.stage} 2 ↗</small><strong>{m.stage2}</strong></div></Link>
      {([3, 4] as const).map((phase) => <button key={phase} aria-pressed={stage === phase} className={stage === phase ? "active" : ""} onClick={() => setStage(phase)}><span>0{phase}</span><div><small>{m.stage} {phase}</small><strong>{phaseLabels[phase]}</strong></div></button>)}
    </nav>
    <div className="stage-summary" aria-live="polite"><div><span className="presentation-eyebrow">{m.stage} {stage} / 4</span><h2>{phaseLabels[stage]}</h2><p>{phaseDescription}</p></div><div><span className="forecast-status">{status}</span><DemoBadge locale={locale} /></div></div>
    <div className="farmer-analysis">
      <div className="farmer-land-column">
        <section className="executive-panel map-panel"><div className="panel-heading"><div><span className="section-number">01</span><h2>{m.selected}</h2></div><strong className="land-area">{formatMetric(plot.area, locale)} {m.ha}</strong></div><div className="map-caption">{plot.farmName} · {plot.cadastralNumber}</div><PresentationMapPanel dataset={data.map} selectedId={plot.id} bounds={plot.bounds} onSelect={setSelectedId} dictionary={dictionary} />{!plot.bounds ? <p className="compact-alert">{m.noGeometry}</p> : null}</section>
        <section className="executive-panel assumptions-panel"><div className="panel-heading"><h2>{m.assumptions}</h2><DemoBadge locale={locale} /></div><dl className="condition-grid"><div><dt>{m.soil}</dt><dd>{conditions.bonitet}<small> / 100</small></dd></div><div><dt>{m.water}</dt><dd>{dictionary.creation.waterOptions[conditions.waterSupply]}</dd></div><div><dt>{m.previous}</dt><dd>{dictionary.plotAnalytics.previousCrops[conditions.previousCrop]}</dd></div></dl><p className="panel-note">{m.assumptionsHint}</p>
          <details className="facts-disclosure"><summary>{m.registry}</summary><dl><div><dt>{m.soil}</dt><dd>{plot.facts.bonitet ?? m.unknown}</dd></div><div><dt>{m.water}</dt><dd>{plot.facts.waterSupply ? dictionary.creation.waterOptions[plot.facts.waterSupply as keyof typeof dictionary.creation.waterOptions] ?? m.unknown : m.unknown}</dd></div><div><dt>{m.previous}</dt><dd>{plot.facts.previousCrop ? dictionary.creation.cropOptions[plot.facts.previousCrop as keyof typeof dictionary.creation.cropOptions] ?? m.unknown : m.unknown}</dd></div></dl></details>
        </section>
      </div>
      <div className="farmer-decision-column">
        <section className="recommendation-section"><div className="section-heading"><h2>{m.recommendations}</h2><span>{m.suitability}</span></div><div className="demo-rank-grid">{result.recommendations.map((item) => <button key={item.cropCode} aria-pressed={selected?.cropCode === item.cropCode} className={`demo-rank ${selected?.cropCode === item.cropCode ? "selected" : ""}`} onClick={() => setCropCode(item.cropCode)}><span className="rank-kicker">0{item.rank} <span aria-hidden="true">↗</span></span><h3>{dictionary.recommendation.cropNames[item.cropCode]}</h3><p><strong>{item.score}</strong><span>/100<br />{m.rating}</span></p><span className="score-track"><i style={{ width: `${item.score}%` }} /></span></button>)}</div>{!selected ? <p>{m.empty}</p> : null}<p className="panel-note">{m.notProbability}</p></section>
        {selected ? <section className="executive-panel explanation-panel"><div className="panel-heading"><h2>{m.why}</h2><span className="selected-crop-name">{dictionary.recommendation.cropNames[selected.cropCode]}</span></div><ul className="reason-list">{selected.reasonKeys.map((key) => <li key={key}><span aria-hidden="true">✓</span>{dictionary.multiStageRecommendation.reasonKeys[key]}</li>)}</ul>
          {stage >= 3 ? <div className="stage-context"><div className="insight-heading"><h3>{m.forecast}</h3><span>{formatMetric(data.forecast.coverage, locale)}% · {m.coverage}</span></div>{balance ? <dl className="context-metrics">{[[m.production, balance.production], [m.demand, balance.demand], [m.deficit, balance.deficit], [m.surplus, balance.surplus]].map(([label, value]) => <div key={String(label)}><dt>{label}</dt><dd>{formatMetric(value as number | null, locale)}<small> {m.tons}</small></dd></div>)}</dl> : <p>{m.noBalance}</p>}<p className="panel-note">{m.demoYield}. {m.pilot}</p></div> : null}
          {stage === 4 ? <div className="logistics-context"><h3>{m.candidate}</h3><dl><div><dt>{m.road}</dt><dd>{m.unknown}</dd></div><div><dt>{m.flows}</dt><dd>{m.unknown}</dd></div></dl><p>{m.logisticsRisk}</p></div> : null}
        </section> : null}
        <section className="executive-panel changes-panel"><div className="panel-heading"><h2>{m.changes}</h2><span>{stage === 1 ? "—" : `${stage === 3 ? 1 : 3} → ${stage}`}</span></div><p>{stage === 1 ? m.base : !result.ratingsChanged ? m.noChange : m.compare}</p>{stage > 1 ? <div className="delta-list">{result.recommendations.map((item) => <span key={item.cropCode}>{dictionary.recommendation.cropNames[item.cropCode]}<strong>{item.delta !== null && item.delta > 0 ? "+" : ""}{item.delta} {m.rating}</strong></span>)}</div> : null}</section>
        <section className="risks-panel"><h2>{m.risks}</h2><ul>{selected?.partialWater ? <li>{m.waterRisk}</li> : null}{selected?.missingRotation ? <li>{m.rotationRisk}</li> : null}<li>{m.normsRisk}</li>{stage >= 3 ? <li>{m.unknownLand}</li> : null}{stage === 4 ? <li>{m.logisticsRisk}</li> : null}</ul>{result.excluded.length ? <details><summary>{m.excluded} · {result.excluded.length}</summary><ul>{result.excluded.map((item) => <li key={item.cropCode}>{dictionary.recommendation.cropNames[item.cropCode]}: {item.exclusions.map((reason) => reason === "water.insufficient" ? m.waterExcluded : reason === "bonitet.belowMinimum" ? m.soilExcluded : m.rotationExcluded).join("; ")}</li>)}</ul></details> : null}</section>
      </div>
    </div>
    <section className="source-footer executive-panel"><div><h2>{m.sources}</h2><p>{m.registry} · {m.geometry}</p><p>{m.assumptions}{stage >= 3 ? ` · ${m.demoYield}` : ""}</p></div><div><span className="forecast-status">{status}</span><p>{m.snapshot}: {new Intl.DateTimeFormat(intlLocales[locale], { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tashkent" }).format(new Date(data.calculatedAt))}</p><p>{m.noOfficial}</p></div></section>
  </div>;
}
