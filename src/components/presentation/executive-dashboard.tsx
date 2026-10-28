"use client";
import { useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/i18n/types";
import { localePathSegments, type Locale } from "@/i18n/config";
import { getPresentationMessages } from "@/i18n/presentation";
import { projectStage, type PresentationData } from "@/modules/presentation/projection";
import { PresentationMapPanel } from "./map-panel";
import { BalanceChart, CoverageChart, DemoBadge, PresentationHero, formatMetric } from "./shared";

export function ExecutiveDashboard({ data, locale, dictionary }: { data: PresentationData; locale: Locale; dictionary: Dictionary }) {
  const m = getPresentationMessages(locale);
  const prefix = `/${localePathSegments[locale]}`;
  const initial = data.plots.find((plot) => plot.bounds)?.id ?? data.plots[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState(initial);
  const [focusSelection, setFocusSelection] = useState(false);
  const selectPlot = (id: string) => { setSelectedId(id); setFocusSelection(true); };
  const selected = data.plots.find((plot) => plot.id === selectedId) ?? data.plots[0];
  if (!selected) return <p>{m.unavailable}</p>;
  const ranked = projectStage(selected.scenario, 1);
  const metrics = [
    { label: m.land, value: formatMetric(data.forecast.totalArea, locale), unit: m.ha, icon: "▱", note: m.registry },
    { label: m.plots, value: String(data.plots.length), unit: m.units, icon: "▦", note: m.registry },
    { label: m.farms, value: String(new Set(data.plots.map((plot) => plot.farmId)).size), unit: m.farmUnits, icon: "⌂", note: m.registry },
    { label: m.coverage, value: formatMetric(data.forecast.coverage, locale), unit: "%", icon: "◔", note: m.demo },
  ];
  return <div className="presentation-page">
    <PresentationHero locale={locale} />
    <div className="pilot-strip"><span aria-hidden="true">ⓘ</span><p>{m.pilot}</p><Link href={`${prefix}/demo`}>{m.farmer} <span aria-hidden="true">↗</span></Link></div>
    <section className="kpi-grid" aria-label={m.overview}>{metrics.map((metric, index) => <article key={metric.label} className={`kpi-card kpi-${index}`}><div className="kpi-label"><span>{metric.label}</span><span className="kpi-icon" aria-hidden="true">{metric.icon}</span></div><p className="kpi-value">{metric.value}<small>{metric.unit}</small></p><p className="kpi-note"><span className="status-dot" />{metric.note}</p></article>)}</section>
    <div className="dashboard-analysis">
      <section className="executive-panel map-panel"><div className="panel-heading"><div><span className="section-number">01</span><h2>{m.map}</h2></div><Link className="subtle-link" href={`${prefix}/map`}>{m.openMap} ↗</Link></div>
        <div className="map-caption"><span className="status-dot" />{m.mapHint}<button type="button" className="subtle-link ml-auto" onClick={() => setFocusSelection(false)}>{m.overview} ↗</button></div>
        <PresentationMapPanel dataset={data.map} selectedId={selected.id} bounds={focusSelection ? selected.bounds : data.map.viewport} onSelect={selectPlot} dictionary={dictionary} />
        <div className="map-footer"><span className="map-legend"><i />{m.registry}</span><span>{data.map.featureCollection.features.length} / {data.plots.length} · {m.geometry}</span></div>
      </section>
      <aside className="executive-panel plot-insight"><div className="panel-heading"><div><span className="section-number">02</span><h2>{m.analysis}</h2></div></div>
        <label className="presentation-label">{m.selectPlot}<select className="presentation-select" value={selected.id} onChange={(event) => selectPlot(event.target.value)}>{data.plots.map((plot) => <option key={plot.id} value={plot.id}>{plot.farmName} · {plot.cadastralNumber}</option>)}</select></label>
        <div className="selected-land"><span>{m.selected}</span><h3>{selected.farmName}</h3><p>{selected.cadastralNumber}<strong>{formatMetric(selected.area, locale)} {m.ha}</strong></p></div>
        {!selected.bounds ? <p className="compact-alert">{m.noGeometry}</p> : null}
        <div className="insight-heading"><h3>{m.recommendations}</h3><DemoBadge locale={locale} /></div>
        <div className="compact-ranks">{ranked.recommendations.map((item) => <div key={item.cropCode}><span className="rank-number">{item.rank.toString().padStart(2, "0")}</span><span>{dictionary.recommendation.cropNames[item.cropCode]}<span className="score-track"><i style={{ width: `${item.score}%` }} /></span></span><strong>{item.score}<small>/100</small></strong></div>)}</div>
        <p className="panel-note">{m.notProbability}</p>
        <Link className="primary-link" href={`${prefix}/demo?plotId=${selected.id}`}>{m.openDemo}<span aria-hidden="true">→</span></Link>
        <Link className="secondary-link" href={`${prefix}/plot/${selected.id}`}>{m.details} ↗</Link>
      </aside>
    </div>
    <div className="dashboard-charts"><BalanceChart data={data} locale={locale} dictionary={dictionary} /><CoverageChart data={data} locale={locale} /></div>
    <footer className="presentation-footnote"><span>SMART EKIN · {data.season}</span><p>{m.noOfficial}</p></footer>
  </div>;
}
