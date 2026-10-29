"use client";
import {useEffect,useRef,useState,type FormEvent,type CSSProperties} from "react";
import Image from "next/image";
import Link from "next/link";
import {LanguageSwitcher} from "@/components/layout/language-switcher";
import type {PresentationData,PresentationPlot} from "@/modules/presentation/projection";
import {FARMER_DEMO_STIR,findDemoFarm} from "@/modules/presentation/farmer-story";
import {projectEvolution,evolvingScenario,type AnalysisLevel} from "@/modules/presentation/evolving-scenario";
import {getDecisionMessages} from "@/i18n/decision-surface";
import {localePathSegments,type Locale} from "@/i18n/config";
import type {Dictionary} from "@/i18n/types";

type Row=ReturnType<typeof projectEvolution>["all"][number];
const asset=(code:string)=>`/images/decision/${code.toLowerCase()}.png`;
export function DecisionSurface({data,locale,dictionary}:{data:PresentationData;locale:Locale;dictionary:Dictionary}){
  const n=getDecisionMessages(locale),prefix=`/${localePathSegments[locale]}`;
  const initialFarm=findDemoFarm(data.plots,FARMER_DEMO_STIR);
  const [farmId,setFarmId]=useState(initialFarm?.id??data.plots[0]?.farmId??"");
  const [plotId,setPlotId]=useState(initialFarm?.plots.find(p=>p.cadastralNumber==="11:10:000234163")?.id??initialFarm?.plots[0]?.id??data.plots[0]?.id??"");
  const [level,setLevel]=useState<AnalysisLevel>(1);
  const [stir,setStir]=useState("");const [lookupError,setLookupError]=useState(false);
  const [dialogMode,setDialogMode]=useState<"farm"|"sources"|null>(null);
  const dialog=useRef<HTMLDialogElement>(null);
  const plot=data.plots.find(p=>p.id===plotId)??data.plots[0];
  const projection=plot?projectEvolution(plot,level):null;
  useEffect(()=>{if(dialogMode&&!dialog.current?.open)dialog.current?.showModal();else if(!dialogMode&&dialog.current?.open)dialog.current.close();},[dialogMode]);
  const f=(value:number,precision=2)=>new Intl.NumberFormat(locale==="ru"||locale==="uz-Cyrl"?"ru-RU":"en-US",{maximumFractionDigits:precision}).format(value);
  const name=(row:Row)=>dictionary.recommendation.cropNames[row.code];
  const previous=(p:PresentationPlot)=>dictionary.plotAnalytics.previousCrops[p.scenario.inputs.plot.previousCrop];
  const risk=(row:Row)=>row.balance!==null&&row.balance>0;
  function conclusion(row:Row){
    if(level===1)return row.agronomy.partialWater?n.initialPartial:n.basicConclusion;
    if(risk(row))return n.surplusConclusion;
    if(row.deficitPercent!==null&&row.deficitPercent<10)return n.nearConclusion;
    if(row.agronomy.partialWater)return n.partialConclusion;
    return level===4?n.finalConclusion:n.deficitConclusion;
  }
  function lookup(event:FormEvent){event.preventDefault();const farm=findDemoFarm(data.plots,stir);if(!farm){setLookupError(true);return;}setFarmId(farm.id);setPlotId(farm.plots.find(p=>p.cadastralNumber==="11:10:000234163")?.id??farm.plots[0].id);setLevel(1);setLookupError(false);}
  function agroFacts(row:Row,compact=false){if(!plot)return null;return <dl className={`dc-agro ${compact?"is-compact":""}`}>
    <div><dt>{n.bonitet}</dt><dd>{plot.scenario.inputs.plot.bonitet} <small>{n.score}</small></dd></div>
    <div><dt>{n.water}</dt><dd className={row.agronomy.partialWater?"is-risk":""}>{dictionary.creation.waterOptions[plot.scenario.inputs.plot.waterSupply]}{row.agronomy.partialWater?<small className="dc-water-warning"> · {n.partial}</small>:null}</dd></div>
    <div><dt>{n.previous}</dt><dd>{previous(plot)}</dd></div>
    <div><dt>{n.rotation}</dt><dd>{row.agronomy.missingRotation?n.limited:n.fit}</dd></div>
  </dl>;}
  function districtFacts(row:Row,compact=false){if(!row.evidence)return null;return <div className={`dc-district-evidence ${compact?"is-compact":""}`}>
    <div className="dc-evidence-label">{n.district}</div><dl className="dc-district-numbers">
      <div><dt>{n.demand}</dt><dd>{f(row.evidence.demand)} <small>{n.tons}</small></dd></div>
      <div><dt>{n.production}</dt><dd>{f(row.evidence.production)} <small>{n.tons}</small></dd></div>
      <div className={risk(row)?"is-risk":"is-forecast"}><dt>{risk(row)?n.surplus:n.deficit}</dt><dd>{risk(row)?"+":""}{f(risk(row)?row.balance!:row.deficit!)} <small>{n.tons}</small><span>{risk(row)?`${f(row.supplyPercent!)}% · ${n.saturation}`:`${f(row.deficitPercent!)}%`}</span></dd></div>
    </dl>
  </div>;}
  function marketFacts(row:Row,compact=false){if(level!==4||!row.evidence)return null;return <div className={`dc-market-evidence ${compact?"is-compact":""}`}>
    <div className="dc-price"><span>{n.market}<i>{n.forecast}</i></span><strong>{f(row.evidence.price[0],0)}–{f(row.evidence.price[1],0)} <small>{n.unitPrice}</small></strong></div>
    <div className="dc-export"><span>{n.export}</span><strong>{row.evidence.exportPotential?n.available:n.limited}</strong><small>{n.exportNote}</small></div>
    <div className="dc-neighbor"><span>{n.potential}</span><strong>Piskent <b aria-hidden="true">→</b> Bo‘ka <em className={row.neighborDeficit!>0?"is-risk":""}>{row.neighborDeficit!>0?`−${f(row.neighborDeficit!)} ${n.tons}`:"0"}</em></strong></div>
  </div>;}
  if(!plot||!projection?.top.length)return <div className="decision-surface"><p>{n.notFound}</p></div>;
  const leader=projection.top[0];const activeIndex=level===1?0:level===3?1:2;
  const levels=[{id:1 as const,code:"01",label:n.initial,factors:n.initialFactors,coverage:null},{id:3 as const,code:"03",label:n.regional,factors:n.regionalFactors,coverage:83},{id:4 as const,code:"04",label:n.complete,factors:n.completeFactors,coverage:98}];
  return <div className="decision-surface" data-scenario-id={evolvingScenario.id} data-provenance={evolvingScenario.provenance}>
    <header className="dc-header"><div className="dc-brand"><Link href={prefix}>SMART <strong>EKIN</strong><svg viewBox="0 0 30 30" aria-hidden="true"><path d="M15 26V12M15 20C3 20 4 9 4 7c11 0 13 8 11 13ZM15 13C16 3 25 3 27 4c0 9-7 12-12 9Z"/></svg></Link><span>{plot.farmName} <i/> {f(plot.area)} {n.ha} · Piskent tumani</span></div><div className="dc-header-actions"><Link href={`${prefix}/map`}>{n.map} ↗</Link><LanguageSwitcher locale={locale} labels={dictionary.languageNames} ariaLabel={dictionary.navigation.language}/><button onClick={()=>setDialogMode("farm")}>{n.change}<span aria-hidden="true">↗</span></button></div></header>
    <div className="dc-workspace">
      <nav className="dc-timeline" aria-label={n.stageNav} style={{"--dc-progress":activeIndex/2} as CSSProperties}><div className="dc-track" aria-hidden="true"/>{levels.map((stage,index)=><button type="button" key={stage.id} aria-pressed={level===stage.id} aria-current={level===stage.id?"step":undefined} aria-label={`${stage.code} ${stage.label}`} aria-controls="dc-analysis" className={`${index===activeIndex?"is-active":index<activeIndex?"is-complete":"is-future"}`} onClick={()=>setLevel(stage.id)}><span className="dc-node">{stage.code}</span><strong>{stage.label}</strong><span className="dc-stage-coverage">{stage.coverage?`${stage.coverage}% ${n.coverage.toLowerCase()}`:n.initialFactors}</span>{stage.coverage?<small>{stage.factors}{stage.id===4?` · ${n.export}`:""}</small>:<small>{n.rotation}</small>}</button>)}</nav>
      <div className="dc-analysis-heading"><div><span>SMART EKIN / {n.samePlot}</span><h1>{n.title}</h1></div>{level>1?<div className="dc-coverage"><div><span>{n.coverage}</span><strong>{projection.coverage}%</strong></div><div className="dc-coverage-track" role="progressbar" aria-label={n.coverage} aria-valuenow={projection.coverage} aria-valuemin={0} aria-valuemax={100} key={level}><i style={{width:`${projection.coverage}%`}}/></div><small>{f(projection.reportedArea,0)} / {f(projection.totalArea,0)} {n.ha} · {level===3?n.preliminary:n.highCoverage}</small></div>:<span className="dc-scope">{n.initialFactors} · {n.rotation}</span>}</div>
      <section id="dc-analysis" className={`dc-analysis dc-level-${level}`} key={`${plot.id}-${level}`} aria-label={levels[activeIndex].label}>
        <article className="dc-hero" data-crop={leader.code}>
          <div className="dc-hero-topline"><span className="dc-rank-medal"><b>1</b> 1-{n.rank}</span><span>{level===1?n.agronomicScore:n.recommendation}</span></div>
          <div className="dc-hero-identity"><div className="dc-crop-portrait"><Image src={asset(leader.code)} alt={name(leader)} width={640} height={460} priority sizes="(min-width: 1600px) 340px, (min-width: 800px) 250px, 160px"/></div><div className="dc-crop-name"><span>{n.agro} {level>1?`+ ${n.district}`:""}</span><h2>{name(leader)}</h2><p className={leader.agronomy.partialWater?"is-risk":"is-positive"}><i/>{leader.agronomy.partialWater?n.attention:n.fit}</p>{leader.rankDelta!==null?<span className="dc-movement">{leader.rankDelta>0?"↑":leader.rankDelta<0?"↓":"—"} {leader.previousRank} → {leader.rank} <small>{n.delta}</small></span>:null}</div><div className="dc-hero-score"><strong>{leader.score}</strong><span>{n.score} <small>/ 100</small></span></div></div>
          <div className="dc-land-evidence"><div className="dc-evidence-label">01 / {n.agro}</div>{agroFacts(leader)}</div>
          {districtFacts(leader)}{marketFacts(leader)}
          <div className="dc-hero-verdict"><span>↗</span><p>{conclusion(leader)}</p></div>
          {level===4?<div className="dc-risk-line"><span>{n.risk}</span><strong className={risk(leader)?"is-risk":"is-positive"}>{risk(leader)?n.high:n.low}</strong><span>{n.agronomicScore}: {leader.agronomy.score} / 100</span></div>:null}
        </article>
        <aside className="dc-alternatives" aria-label="TOP-3">{projection.top.slice(1).map(row=><article className={`dc-alternative ${risk(row)?"has-surplus":""}`} key={row.code} data-crop={row.code}>
          <div className="dc-alternative-heading"><span className="dc-alt-rank">0{row.rank}</span><Image src={asset(row.code)} alt={name(row)} width={160} height={110} sizes="100px"/><div><h2>{name(row)}</h2><span>{row.rankDelta===null?n.agro:`${row.rankDelta>0?"↑":row.rankDelta<0?"↓":"—"} ${row.previousRank} → ${row.rank} · ${n.agronomicScore} ${row.agronomy.score}`}</span></div><strong>{row.score}<small>{n.score}</small></strong></div>
          {agroFacts(row,true)}{districtFacts(row,true)}{marketFacts(row,true)}
          <p className={`dc-alt-reason ${risk(row)?"is-risk":""}`}>{risk(row)?"! ":""}{conclusion(row)}</p>
          {risk(row)?<span className="dc-surplus-warning">{n.risk.toUpperCase()}</span>:null}
        </article>)}</aside>
      </section>
      <section className="dc-ranking-strip" aria-label={n.ranking}><span>{level===1?n.agronomicScore:n.ranking}</span>{projection.all.map(row=><div key={row.code}><strong>{dictionary.recommendation.cropNames[row.code]}</strong><span>{row.previousRank!==null?`${row.previousRank} → `:""}#{row.rank}</span>{row.rankDelta!==null&&row.rankDelta!==0?<b className={row.rankDelta>0?"is-positive":"is-risk"}>{row.rankDelta>0?"↑":"↓"}{Math.abs(row.rankDelta)}</b>:null}</div>)}</section>
      <footer className="dc-footer"><span>{plot.cadastralNumber} · {n.samePlot}</span><button type="button" onClick={()=>setDialogMode("sources")}>{n.sources} <span aria-hidden="true">ⓘ</span></button>{level===4?<p>{n.noGuarantee}</p>:null}</footer>
    </div>
    <dialog ref={dialog} className="dc-dialog" onCancel={()=>setDialogMode(null)} aria-labelledby="dc-dialog-title"><div className="dc-dialog-heading"><h2 id="dc-dialog-title">{dialogMode==="farm"?n.farm:n.sources}</h2><button onClick={()=>setDialogMode(null)} aria-label={n.close}>×</button></div>{dialogMode==="farm"?<><form onSubmit={lookup}><label htmlFor="dc-stir">{n.stir}</label><div><input id="dc-stir" inputMode="numeric" maxLength={9} value={stir} onChange={e=>setStir(e.target.value.replace(/\D/g,""))}/><button type="submit">{n.find} →</button></div><p>{n.reference}: <button type="button" onClick={()=>setStir(FARMER_DEMO_STIR)}>{FARMER_DEMO_STIR}</button></p>{lookupError?<p role="alert" className="is-risk">{n.notFound}</p>:null}</form><h3>{n.choose}</h3><div className="dc-plot-options">{data.plots.filter(p=>p.farmId===farmId).map(p=><button key={p.id} aria-pressed={plot.id===p.id} onClick={()=>{setPlotId(p.id);setLevel(1);setDialogMode(null);}}><strong>{p.cadastralNumber}</strong><span>{f(p.area)} {n.ha} →</span></button>)}</div></>:<><p>{n.provenance}</p><p>{n.unknownLand}</p><p>{n.noGuarantee}</p><p>{n.noRoute}</p><h3>{n.calculations}</h3><p>01: {n.agronomicScore} · 100%</p><p>03: 40% {n.agronomicScore} + 60% {n.district}</p><p>04: 40% {n.agronomicScore} + 30% {n.district} + 30% {n.marketOutlook}</p><p>{n.saturation}: {n.production} / {n.demand} × 100</p></>}</dialog>
  </div>;
}
