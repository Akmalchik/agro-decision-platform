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
import { CropArtwork, LandReasonCard, DistrictReasonCard, MarketReasonCard } from "./farmer-stage-cards";
import { getFarmerStageMessages } from "@/i18n/farmer-stage-ui";

function Sprout({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M32 55V27M32 39C13 39 9 24 10 13c15-1 25 9 22 26ZM32 29C32 13 43 7 55 9c1 13-9 22-23 20Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 55h32" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>;
}

export function FarmerStory({ data, locale, dictionary }: { data: PresentationData; locale: Locale; dictionary: Dictionary }) {
  const m = getFarmerStoryMessages(locale);
  const n = getFarmerStageMessages(locale);
  const old = getPresentationMessages(locale);
  const prefix = `/${localePathSegments[locale]}`;
  const [activeStage, setActiveStage] = useState<1 | 3 | 4>(1);
  const [visited, setVisited] = useState<number[]>([1]);
  const [setupOpen, setSetupOpen] = useState(true);
  const [stir, setStir] = useState("");
  const [found, setFound] = useState(false);
  const [error, setError] = useState("");
  const [plotId, setPlotId] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropCode | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [coverageVisible, setCoverageVisible] = useState(false);
  const coverageRef = useRef<HTMLDivElement>(null);
  const farmRef = useRef<HTMLElement>(null);
  const landRef = useRef<HTMLDivElement>(null);
  const farm = found ? findDemoFarm(data.plots, FARMER_DEMO_STIR) : null;
  const plot = farm?.plots.find(row => row.id === plotId) ?? null;
  const suitability = plot ? farmerSuitability(plot) : null;
  const eligible = suitability ? [...suitability.top, ...suitability.additional] : [];
  const allResults = [...eligible, ...(suitability?.excluded ?? [])];
  const selected = allResults.find(row => row.cropCode === crop) ?? eligible[0] ?? null;
  const context = selected ? farmerDistrictContext(selected.cropCode) : null;
  const number = (value: number | null | undefined) => value == null ? m.unknown : new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
  const cropName = (code: CropCode) => dictionary.recommendation.cropNames[code];
  const exclusion = (reason: string) => reason === "water.insufficient" ? m.waterExcluded : reason === "bonitet.belowMinimum" ? m.soilExcluded : m.rotationExcluded;

  useEffect(() => {
    if (found) farmRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }, [found]);
  useEffect(() => {
    if (plotId && !setupOpen) landRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }, [plotId, activeStage, setupOpen]);

  useEffect(() => {
    const element = coverageRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setCoverageVisible(true); observer.disconnect(); }
    }, { threshold: 0.25 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [plotId, activeStage]);

  function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPlotId(null); setCrop(null);
    if (!/^\d{9}$/.test(stir.trim())) { setError(m.invalid); setFound(false); return; }
    if (!findDemoFarm(data.plots, stir)) { setError(m.notFound); setFound(false); return; }
    setError(""); setFound(true);
  }
  function choosePlot(id: string) {
    if (id === plotId) { setSetupOpen(false); return; }
    setPlotId(id); setCrop(null); setMapVisible(false); setCoverageVisible(false);
    setActiveStage(1); setVisited([1]); setSetupOpen(false);
  }

  function showStage(stage:1|3|4) {
    setActiveStage(stage); setVisited(rows => rows.includes(stage) ? rows : [...rows, stage]);
    setMapVisible(false); setCoverageVisible(false);
  }
  const stages = [
    {value:1 as const,code:"01",title:m.land,label:n.landLabel,question:n.landQuestion,evidence:n.landData},
    {value:3 as const,code:"03",title:m.district,label:n.districtLabel,question:n.districtQuestion,evidence:n.districtData},
    {value:4 as const,code:"04",title:m.market,label:n.marketLabel,question:n.marketQuestion,evidence:n.marketData},
  ];
  const forecastChoices = eligible.filter(row => context?.district.products.some(product => product.code === row.cropCode));
  return <div className={`farmer-story ${plot && !setupOpen ? "is-presenting" : ""}`}>
    <div className="fsu-setup" hidden={!!plot && !setupOpen}>
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

    </div>
    {plot && suitability ? <div ref={landRef} className="fs-story" key={plot.id}>
      <div className="fsu-context"><div><h1>{m.title}</h1><span>{farm?.name} · {plot.cadastralNumber} · {number(plot.area)} {m.ha}</span></div><button type="button" onClick={() => setSetupOpen(open => !open)}>{n.change} ↗</button></div>
      <div className="fsu-navigation">
        <nav aria-label={n.stageNav}>{stages.map(stage => <button type="button" key={stage.value} className={`fsu-step ${activeStage===stage.value ? "is-active" : ""}`} aria-pressed={activeStage===stage.value} aria-current={activeStage===stage.value?"step":undefined} aria-controls="fs-stage-panel" aria-label={`${stage.code} ${stage.title} · ${stage.label}`} onClick={() => showStage(stage.value)}>
          <span className="fsu-step-number" aria-hidden="true">{visited.includes(stage.value)&&activeStage!==stage.value?"✓":stage.code}</span><span className="fsu-step-text"><strong>{stage.code} {stage.title}</strong><span>{stage.label}</span><small>{stage.evidence}</small></span>
        </button>)}</nav>
        <div className="fsu-evolution"><span>{n.evolution}</span>{selected?<span className="fsu-selected-crop"><CropArtwork code={selected.cropCode}/>{cropName(selected.cropCode)}</span>:null}</div>
      </div>
      <div id="fs-stage-panel">
      {activeStage===1?<section key="land" id="fs-land" className="fs-stage fsu-stage" aria-labelledby="fs-land-title">
        <div className="fs-stage-label"><span>01</span><strong>1-{m.stage} · {m.land}</strong></div>
        <h2 id="fs-land-title">{m.landTitle}</h2><p className="fs-subtitle">{m.selectCrop}</p>
        <div className="fs-top-heading"><h3>{m.top}</h3><span className="fs-badge">{m.demoConditions}</span></div>
        <div className="fs-crop-grid">{suitability.top.map((row, index) => <button key={row.cropCode} aria-pressed={selected?.cropCode === row.cropCode} className={`fs-crop-card ${selected?.cropCode === row.cropCode ? "is-selected" : ""}`} onClick={() => setCrop(row.cropCode)}><span className="fs-crop-rank">0{index + 1}<CropArtwork code={row.cropCode}/></span><h3>{cropName(row.cropCode)}</h3><span className="fsu-crop-status">{selected?.cropCode===row.cropCode?n.chosen:index===0?n.best:n.suitable}</span><span className="fs-score fs-value">{row.score}<small>{m.points} / 100</small></span><span className="fs-score-bar" aria-hidden="true"><i style={{ width: `${row.score}%` }}/></span></button>)}</div>
        {suitability.additional.length ? <div className="fs-additional"><h3>{m.additional}</h3><div>{suitability.additional.map(row => <button key={row.cropCode} aria-pressed={selected?.cropCode === row.cropCode} onClick={() => setCrop(row.cropCode)} className={selected?.cropCode === row.cropCode ? "is-selected" : ""}>{cropName(row.cropCode)}<span>{row.score} {m.points}</span>{selected?.cropCode===row.cropCode?<span className="fsu-choice-selected">✓ {n.chosen}</span>:null}</button>)}</div></div> : null}
        {!selected ? <p className="fs-empty">{m.noCrop}</p> : <LandReasonCard plot={plot} result={selected} locale={locale} dictionary={dictionary}/>}
        <p className="fs-note">{m.scoreNote}</p>
        <details className="fs-disclosure"><summary>{m.whyNot}</summary><h4>{m.exclusions}</h4>{suitability.excluded.length ? <ul>{suitability.excluded.map(row => <li key={row.cropCode}><button type="button" onClick={() => setCrop(row.cropCode)}>{cropName(row.cropCode)} ↗</button> — {row.exclusions.map(exclusion).join("; ")}</li>)}</ul> : <p>{m.noExcluded}</p>}</details>
        <details className="fs-disclosure"><summary>{m.sources}</summary><p>{m.assumptions}</p><p>{m.actual}</p><h4>{m.facts}</h4><dl className="fs-facts"><div><dt>{m.soil}</dt><dd>{plot.facts.bonitet ?? m.unknown}</dd></div><div><dt>{m.water}</dt><dd>{plot.facts.waterSupply ? dictionary.creation.waterOptions[plot.facts.waterSupply as keyof typeof dictionary.creation.waterOptions] ?? m.unknown : m.unknown}</dd></div><div><dt>{old.previous}</dt><dd>{plot.facts.previousCrop ? dictionary.creation.cropOptions[plot.facts.previousCrop as keyof typeof dictionary.creation.cropOptions] ?? m.unknown : m.unknown}</dd></div></dl><Link href={`${prefix}/plot/${plot.id}`}>{m.details} ↗</Link></details>
        <details className="fs-disclosure fs-optional-map" onToggle={event => setMapVisible(event.currentTarget.open)}><summary>{m.map}</summary>{mapVisible ? plot.bounds ? <PresentationMapPanel dataset={data.map} selectedId={plot.id} bounds={plot.bounds} onSelect={id => { if (farm?.plots.some(row => row.id === id)) choosePlot(id); }} dictionary={dictionary}/> : <p>{m.noGeometry}</p> : null}</details>
        <div className="fsu-stage-actions"><button type="button" className="fs-primary" onClick={() => showStage(3)}>{n.next} · 03 {m.district} →</button></div>
      </section>:null}

      {selected && context ? <>
        {activeStage===3?<section key="district" id="fs-district" className="fs-stage fsu-stage" aria-labelledby="fs-district-title">
          <div className="fs-stage-label"><span>03</span><strong>3-{m.stage} · {m.district}</strong></div><h2 id="fs-district-title">{m.districtTitle}</h2><p className="fs-subtitle">{cropName(selected.cropCode)} · {n.piskent} · {n.districtSubtitle}</p>
          <div className="fs-scope-notice"><span className="fs-badge">{m.demo}</span><p>{n.sourceDistrict}</p></div>
          <div className={`fs-district-grid ${context.product ? "" : "fsu-without-forecast"}`}>
          {context.product?<DistrictReasonCard context={context} locale={locale}/>:<section className="fsu-missing-forecast fs-surface"><CropArtwork code={selected.cropCode}/><div><h3>{cropName(selected.cropCode)}</h3><p>{n.missingForecast}</p><strong>{n.chooseForecast}</strong><div className="fsu-forecast-choices">{forecastChoices.map(row=><button type="button" key={row.cropCode} onClick={()=>setCrop(row.cropCode)}><CropArtwork code={row.cropCode}/>{cropName(row.cropCode)} ↗</button>)}</div>{!forecastChoices.length?<p>{n.noEligibleForecast}</p>:null}</div></section>}
          <section className="fs-coverage fs-surface"><h3>{m.coverage}</h3><strong className="fs-coverage-value fs-value">{number(context.district.coverage)}<small>%</small></strong><div ref={coverageRef} className={`fs-progress ${coverageVisible ? "is-visible" : ""}`} role="progressbar" aria-label={m.coverage} aria-valuenow={context.district.coverage} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${context.district.coverage}%` }}/></div><p className="fs-area-fraction"><strong>{number(context.district.reportedHa)} {m.ha}</strong> / {number(context.district.totalHa)} {m.ha}</p><span className="fs-coverage-status">{locale === "uz-Latn" ? coverageStatus(context.district.coverage) : context.district.forecastReady ? old.forecast : old.waiting}</span><h4>{context.district.forecastReady ? m.formed : old.waiting}</h4><p>{m.threshold}</p><details className="fsu-coverage-info"><summary>{n.coverageInfo}</summary><p>{number(context.district.unknownHa)} {m.ha} · {m.unknownLand}</p></details></section></div>
          {context.product ? <details className="fs-disclosure"><summary>{m.formulas} · DEMO</summary><p>{m.population}: {number(context.district.demoPopulation)} × {m.consumption}: {number(context.product.consumptionKgPerPerson)} kg ÷ 1 000 = {number(context.product.need)} {m.tons}</p><p>{number(context.product.plannedHa)} {m.ha} × {m.yield}: {number(context.product.yieldTonsPerHa)} {m.tons}/{m.ha} = {number(context.product.production)} {m.tons}</p><p>{m.balance} = {m.production} − {m.demand}</p><p>{m.regionalDemo}</p></details> : null}
          <p className="fs-note">{m.unchanged}</p><details className="fs-disclosure"><summary>{m.pilotCoverage}</summary><p>{number(data.forecast.coverage)}% · {number(data.forecast.coveredArea)} / {number(data.forecast.totalArea)} {m.ha}</p><p>{old.pilot}</p></details>
          <div className="fsu-stage-actions"><button type="button" onClick={()=>showStage(1)}>← 01 {m.land}</button><button type="button" className="fs-primary" onClick={()=>showStage(4)}>{n.next} · 04 {m.market} →</button></div>
        </section>:null}
        {activeStage===4?<section key="market" id="fs-market" className="fs-stage fsu-stage" aria-labelledby="fs-market-title">
          <div className="fs-stage-label"><span>04</span><strong>4-{m.stage} · {m.market}</strong></div><h2 id="fs-market-title">{m.marketTitle}</h2>
          <div className="fsu-market-comparison"><article className="fs-surface"><span>{n.piskent}</span><strong className="fsu-origin-balance">{context.product?.balance===null||context.product?.balance===undefined?m.unknown:context.product.balance===0?m.balanced:`${context.product.balance>0?"+":"−"}${number(Math.abs(context.product.balance))} ${m.tons}`}</strong><small>{m.balance}</small></article><div className="fsu-market-arrow"><CropArtwork code={selected.cropCode}/><strong>{cropName(selected.cropCode)}</strong><span aria-hidden="true">⟶</span></div><article className="fs-surface"><span>{m.buka}</span><strong className="fsu-destination-balance">{context.deficit===null?m.unknown:`−${number(context.deficit)} ${m.tons}`}</strong><small>{m.deficit}</small></article></div>
          <p className="fsu-direction-note">{n.directionNote} · DEMO</p>
          <MarketReasonCard context={context} eligible={selected.eligible} locale={locale}/>
          {context.buka ? <details className="fs-disclosure"><summary>{m.formulas} · {m.buka} · DEMO</summary><p>{number(context.buka.population)} × {number(context.buka.kgPerPerson)} kg ÷ 1 000 = {number(context.buka.demand)} {m.tons}</p><p>{number(context.buka.plannedHa)} {m.ha} × {number(context.buka.yieldTonsPerHa)} {m.tons}/{m.ha} = {number(context.buka.production)} {m.tons}</p><p>{number(context.buka.demand)} − {number(context.buka.production)} = {number(context.deficit)} {m.tons}</p><p>{m.bukaDemo}</p></details> : null}
          <details className="fs-disclosure"><summary>{m.sources}</summary><p>{m.noRoute}</p><p>{m.notFlow}</p><p>{m.bukaDemo}</p></details>
          <div className="fsu-stage-actions"><button type="button" onClick={()=>showStage(3)}>← 03 {m.district}</button><button type="button" onClick={()=>showStage(1)}>01 {m.land} ↗</button></div>
        </section>:null}
      </> : null}
      </div>
    </div> : null}
    <footer className="fs-footer"><span>SMART EKIN · {m.title}</span><span>{m.readOnly}</span></footer>
  </div>;
}
