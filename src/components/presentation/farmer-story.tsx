"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import type { PresentationData } from "@/modules/presentation/projection";
import { FARMER_DEMO_STIR, findDemoFarm, farmerSuitability, farmerDistrictContext } from "@/modules/presentation/farmer-story";
import { coverageStatus } from "@/modules/regional/demo";
import { getFarmerStoryMessages } from "@/i18n/farmer-story";
import { getPresentationMessages } from "@/i18n/presentation";
import { localePathSegments, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { CropCode } from "@/modules/recommendations/domain/first-stage-recommendation";
import { PresentationMapPanel } from "./map-panel";

function Sprout({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M32 55V27M32 39C13 39 9 24 10 13c15-1 25 9 22 26ZM32 29C32 13 43 7 55 9c1 13-9 22-23 20Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 55h32" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>;
}

function StoryTransition({ from, to, href, label }: { from: string; to: string; href: string; label: string }) {
  return <div className="fs-transition"><span>{from}</span><i aria-hidden="true">↓</i><strong>{to}</strong><a href={href}>{label} <span aria-hidden="true">↓</span></a></div>;
}

export function FarmerStory({ data, locale, dictionary }: { data: PresentationData; locale: Locale; dictionary: Dictionary }) {
  const m = getFarmerStoryMessages(locale);
  const old = getPresentationMessages(locale);
  const prefix = `/${localePathSegments[locale]}`;
  const [stir, setStir] = useState("");
  const [found, setFound] = useState(false);
  const [error, setError] = useState("");
  const [plotId, setPlotId] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropCode | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [coverageVisible, setCoverageVisible] = useState(false);
  const coverageRef = useRef<HTMLDivElement>(null);
  const farmRef = useRef<HTMLElement>(null);
  const landRef = useRef<HTMLElement>(null);
  const farm = found ? findDemoFarm(data.plots, FARMER_DEMO_STIR) : null;
  const plot = farm?.plots.find(row => row.id === plotId) ?? null;
  const suitability = plot ? farmerSuitability(plot) : null;
  const eligible = suitability ? [...suitability.top, ...suitability.additional] : [];
  const selected = eligible.find(row => row.cropCode === crop) ?? eligible[0] ?? null;
  const context = selected ? farmerDistrictContext(selected.cropCode) : null;
  const number = (value: number | null | undefined) => value == null ? m.unknown : new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
  const cropName = (code: CropCode) => dictionary.recommendation.cropNames[code];
  const exclusion = (reason: string) => reason === "water.insufficient" ? m.waterExcluded : reason === "bonitet.belowMinimum" ? m.soilExcluded : m.rotationExcluded;

  useEffect(() => {
    if (found) farmRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }, [found]);
  useEffect(() => {
    if (plotId) landRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }, [plotId]);

  useEffect(() => {
    const element = coverageRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setCoverageVisible(true); observer.disconnect(); }
    }, { threshold: 0.25 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [plotId]);

  function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPlotId(null); setCrop(null);
    if (!/^\d{9}$/.test(stir.trim())) { setError(m.invalid); setFound(false); return; }
    if (!findDemoFarm(data.plots, stir)) { setError(m.notFound); setFound(false); return; }
    setError(""); setFound(true);
  }
  function choosePlot(id: string) {
    if (id === plotId) return;
    setPlotId(id); setCrop(null); setMapVisible(false); setCoverageVisible(false);
  }

  return <div className="farmer-story">
    <header className="fs-hero">
      <div><span className="fs-eyebrow">SMART EKIN · {m.title}</span><h1>{m.title}</h1><p>{m.intro}</p><span className="fs-readonly"><i aria-hidden="true"/>{m.readOnly}</span></div>
      <div className="fs-hero-art" aria-hidden="true"><Sprout/><span>01 <i>→</i> 03 <i>→</i> 04</span></div>
    </header>

    <section className="fs-search fs-surface" aria-labelledby="fs-find-title">
      <div className="fs-search-heading"><span className="fs-icon" aria-hidden="true">⌕</span><div><span className="fs-eyebrow">SMART EKIN</span><h2 id="fs-find-title">{m.findTitle}</h2></div></div>
      <form onSubmit={lookup} noValidate>
        <label htmlFor="fs-stir">{m.stir}</label>
        <div className="fs-search-row"><input id="fs-stir" inputMode="numeric" autoComplete="off" maxLength={9} value={stir} onChange={event => { setStir(event.target.value.replace(/\D/g, "")); setError(""); setFound(false); setPlotId(null); setCrop(null); }} placeholder="123456789" aria-invalid={!!error} aria-describedby={error ? "fs-stir-error fs-alias" : "fs-alias"}/><button className="fs-primary" type="submit">{m.find}<span aria-hidden="true">→</span></button></div>
        <div className="fs-demo-fill"><span>{m.demoFor}:</span><button type="button" onClick={() => { setStir(FARMER_DEMO_STIR); setError(""); }}>{FARMER_DEMO_STIR} <span aria-hidden="true">↗</span></button><span className="fs-badge">DEMO</span></div>
        <p id="fs-alias" className="fs-note">{m.alias}</p>
        {error ? <p id="fs-stir-error" role="alert" className="fs-error">{error}</p> : null}
      </form>
    </section>

    {farm ? <section ref={farmRef} className="fs-farm fs-reveal" aria-labelledby="fs-farm-title">
      <div className="fs-section-heading"><div><span className="fs-eyebrow">{m.found}</span><h2 id="fs-farm-title">{farm.name}</h2><p>{m.region}</p></div><span className="fs-pilot-badge">{m.pilot}</span></div>
      <div className="fs-farm-summary"><div><span>{m.area}</span><strong className="fs-value">{number(farm.area)} <small>{m.ha}</small></strong></div><div><span>{m.plots}</span><strong className="fs-value">{farm.plots.length}</strong></div><div className="fs-farm-region"><Sprout/><span>{m.actual}</span></div></div>
      <h3 className="fs-choose-title">{m.choose}</h3>
      <div className="fs-plot-grid">{farm.plots.map(row => <button key={row.id} className={`fs-plot-card ${plotId === row.id ? "is-selected" : ""}`} aria-pressed={plotId === row.id} onClick={() => choosePlot(row.id)}>
        <span className="fs-plot-top"><span>{m.cadastral}</span><span aria-hidden="true">{plotId === row.id ? "✓" : "↗"}</span></span><strong>{row.cadastralNumber}</strong><span className="fs-plot-area">{number(row.area)} <small>{m.ha}</small></span><span className="fs-condition-label">{m.demoConditions}</span><span className="fs-plot-conditions">{m.soil}: {row.scenario.inputs.plot.bonitet} · {m.water}: {dictionary.creation.waterOptions[row.scenario.inputs.plot.waterSupply]}</span>
      </button>)}</div>
    </section> : null}

    {plot && suitability ? <div className="fs-story" key={plot.id}>
      <div className="fs-story-heading"><span className="fs-eyebrow">{plot.cadastralNumber} · {number(plot.area)} {m.ha}</span><p>{m.land}<span aria-hidden="true">→</span>{m.district}<span aria-hidden="true">→</span>{m.market}</p></div>
      <section ref={landRef} id="fs-land" className="fs-stage fs-reveal" aria-labelledby="fs-land-title">
        <div className="fs-stage-label"><span>01</span><strong>1-{m.stage} · {m.land}</strong></div>
        <h2 id="fs-land-title">{m.landTitle}</h2><p className="fs-subtitle">{m.selectCrop}</p>
        <div className="fs-top-heading"><h3>{m.top}</h3><span className="fs-badge">{m.demoConditions}</span></div>
        <div className="fs-crop-grid">{suitability.top.map((row, index) => <button key={row.cropCode} aria-pressed={selected?.cropCode === row.cropCode} className={`fs-crop-card ${selected?.cropCode === row.cropCode ? "is-selected" : ""}`} onClick={() => setCrop(row.cropCode)}><span className="fs-crop-rank">0{index + 1}<Sprout/></span><h3>{cropName(row.cropCode)}</h3><span className="fs-score fs-value">{row.score}<small>{m.points} / 100</small></span><span className="fs-score-bar" aria-hidden="true"><i style={{ width: `${row.score}%` }}/></span></button>)}</div>
        {suitability.additional.length ? <div className="fs-additional"><h3>{m.additional}</h3><div>{suitability.additional.map(row => <button key={row.cropCode} aria-pressed={selected?.cropCode === row.cropCode} onClick={() => setCrop(row.cropCode)} className={selected?.cropCode === row.cropCode ? "is-selected" : ""}>{cropName(row.cropCode)}<span>{row.score} {m.points}</span></button>)}</div></div> : null}
        {!selected ? <p className="fs-empty">{m.noCrop}</p> : <section className="fs-why fs-surface" key={selected.cropCode} aria-live="polite"><div><span className="fs-eyebrow">{m.selected} · {cropName(selected.cropCode)}</span><h3>{m.why}</h3></div><ul>{selected.reasonKeys.map(reason => <li key={reason}><span aria-hidden="true">✓</span>{dictionary.multiStageRecommendation.reasonKeys[reason]}</li>)}</ul>{!selected.reasonKeys.length ? <p>{m.noReasons}</p> : null}{selected.partialWater ? <p className="fs-warning">{m.partialWater}</p> : null}{selected.missingRotation ? <p className="fs-warning">{m.missingRotation}</p> : null}</section>}
        <p className="fs-note">{m.scoreNote}</p>
        <details className="fs-disclosure"><summary>{m.whyNot}</summary><h4>{m.exclusions}</h4>{suitability.excluded.length ? <ul>{suitability.excluded.map(row => <li key={row.cropCode}><strong>{cropName(row.cropCode)}</strong> — {row.exclusions.map(exclusion).join("; ")}</li>)}</ul> : <p>{m.noExcluded}</p>}</details>
        <details className="fs-disclosure"><summary>{m.sources}</summary><p>{m.assumptions}</p><p>{m.actual}</p><h4>{m.facts}</h4><dl className="fs-facts"><div><dt>{m.soil}</dt><dd>{plot.facts.bonitet ?? m.unknown}</dd></div><div><dt>{m.water}</dt><dd>{plot.facts.waterSupply ? dictionary.creation.waterOptions[plot.facts.waterSupply as keyof typeof dictionary.creation.waterOptions] ?? m.unknown : m.unknown}</dd></div><div><dt>{old.previous}</dt><dd>{plot.facts.previousCrop ? dictionary.creation.cropOptions[plot.facts.previousCrop as keyof typeof dictionary.creation.cropOptions] ?? m.unknown : m.unknown}</dd></div></dl><Link href={`${prefix}/plot/${plot.id}`}>{m.details} ↗</Link></details>
        <details className="fs-disclosure fs-optional-map" onToggle={event => setMapVisible(event.currentTarget.open)}><summary>{m.map}</summary>{mapVisible ? plot.bounds ? <PresentationMapPanel dataset={data.map} selectedId={plot.id} bounds={plot.bounds} onSelect={id => { if (farm?.plots.some(row => row.id === id)) choosePlot(id); }} dictionary={dictionary}/> : <p>{m.noGeometry}</p> : null}</details>
      </section>

      {selected && context ? <>
        <StoryTransition from={m.yourLand} to={m.districtForecast} href="#fs-district" label={m.continue}/>
        <section id="fs-district" className="fs-stage" aria-labelledby="fs-district-title">
          <div className="fs-stage-label"><span>03</span><strong>3-{m.stage} · {m.district}</strong></div><h2 id="fs-district-title">{m.districtTitle}</h2><p className="fs-subtitle">{m.districtForecast} · {cropName(selected.cropCode)}</p>
          <div className="fs-scope-notice"><span className="fs-badge">{m.demo}</span><p>{m.regionalDemo}</p></div>
          <div className="fs-district-grid"><div className="fs-forecast fs-surface" key={selected.cropCode}>
            {context.product ? <><div className="fs-forecast-numbers"><div><span>{m.planned}</span><strong className="fs-value">{number(context.product.plannedHa)}<small>{m.ha}</small></strong></div><div><span>{m.production}</span><strong className="fs-value">{number(context.product.production)}<small>{m.tons}</small></strong></div><div><span>{m.demand}</span><strong className="fs-value">{number(context.product.need)}<small>{m.tons}</small></strong></div></div><div className={`fs-balance ${context.product.balance !== null && context.product.balance < 0 ? "is-deficit" : ""}`}><span>{m.balance}</span><strong className="fs-value">{context.product.balance === null ? m.unknown : context.product.balance === 0 ? m.balanced : `${context.product.balance > 0 ? "+" : "−"}${number(Math.abs(context.product.balance))} ${m.tons}`}</strong><small>{context.product.balance === null ? "" : context.product.balance < 0 ? m.deficit : context.product.balance > 0 ? m.surplus : m.balanced}</small></div></> : <div className="fs-empty"><Sprout/><h3>{cropName(selected.cropCode)}</h3><p>{m.noForecast}</p></div>}
          </div><section className="fs-coverage fs-surface"><h3>{m.coverage}</h3><strong className="fs-coverage-value fs-value">{number(context.district.coverage)}<small>%</small></strong><div ref={coverageRef} className={`fs-progress ${coverageVisible ? "is-visible" : ""}`} role="progressbar" aria-label={m.coverage} aria-valuenow={context.district.coverage} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${context.district.coverage}%` }}/></div><p className="fs-area-fraction"><strong>{number(context.district.reportedHa)} {m.ha}</strong> / {number(context.district.totalHa)} {m.ha}</p><span className="fs-coverage-status">{locale === "uz-Latn" ? coverageStatus(context.district.coverage) : context.district.forecastReady ? old.forecast : old.waiting}</span><h4>{context.district.forecastReady ? m.formed : old.waiting}</h4><p>{m.threshold}</p><p className="fs-note">{number(context.district.unknownHa)} {m.ha} · {m.unknownLand}</p></section></div>
          {context.product ? <details className="fs-disclosure"><summary>{m.formulas} · DEMO</summary><p>{m.population}: {number(context.district.demoPopulation)} × {m.consumption}: {number(context.product.consumptionKgPerPerson)} kg ÷ 1 000 = {number(context.product.need)} {m.tons}</p><p>{number(context.product.plannedHa)} {m.ha} × {m.yield}: {number(context.product.yieldTonsPerHa)} {m.tons}/{m.ha} = {number(context.product.production)} {m.tons}</p><p>{m.balance} = {m.production} − {m.demand}</p><p>{m.regionalDemo}</p></details> : null}
          <p className="fs-note">{m.unchanged}</p><details className="fs-disclosure"><summary>{m.pilotCoverage}</summary><p>{number(data.forecast.coverage)}% · {number(data.forecast.coveredArea)} / {number(data.forecast.totalArea)} {m.ha}</p><p>{old.pilot}</p></details>
        </section>
        <StoryTransition from={m.districtForecast} to={`${m.nearby} → ${m.buka}`} href="#fs-market" label={m.continueMarket}/>
        <section id="fs-market" className="fs-stage" aria-labelledby="fs-market-title"><div className="fs-stage-label"><span>04</span><strong>4-{m.stage} · {m.market}</strong></div><h2 id="fs-market-title">{m.marketTitle}</h2>
          <div className="fs-market-card fs-surface" key={selected.cropCode}><div className="fs-market-route"><span>Piskent</span><i aria-hidden="true">→</i><strong>{m.buka}</strong><span className="fs-badge">DEMO</span></div><div className="fs-market-content"><div><span className="fs-eyebrow">{cropName(selected.cropCode)}</span><h3>{context.buka ? m.deficit : m.nearby}</h3>{context.deficit !== null ? <strong className="fs-market-deficit fs-value">−{number(context.deficit)} <small>{m.tons}</small></strong> : <p className="fs-empty">{m.noMarket}</p>}</div><div>{context.option ? <p className="fs-opportunity">{m.opportunity}</p> : null}<p>{m.noBuyer}</p><p className="fs-warning">{m.noRoute}</p></div></div><p className="fs-market-footer">{m.notFlow}</p></div>
          {context.buka ? <details className="fs-disclosure"><summary>{m.formulas} · {m.buka} · DEMO</summary><p>{number(context.buka.population)} × {number(context.buka.kgPerPerson)} kg ÷ 1 000 = {number(context.buka.demand)} {m.tons}</p><p>{number(context.buka.plannedHa)} {m.ha} × {number(context.buka.yieldTonsPerHa)} {m.tons}/{m.ha} = {number(context.buka.production)} {m.tons}</p><p>{number(context.buka.demand)} − {number(context.buka.production)} = {number(context.deficit)} {m.tons}</p><p>{m.bukaDemo}</p></details> : null}<p className="fs-note">{m.bukaDemo}</p>
        </section>
      </> : null}
    </div> : null}
    <footer className="fs-footer"><span>SMART EKIN · {m.title}</span><span>{m.readOnly}</span></footer>
  </div>;
}
