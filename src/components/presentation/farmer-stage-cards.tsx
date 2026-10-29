import type { ReactNode } from "react";
import type { CropCode } from "@/modules/recommendations/domain/first-stage-recommendation";
import type { PresentationPlot } from "@/modules/presentation/projection";
import type { farmerSuitability, farmerDistrictContext } from "@/modules/presentation/farmer-story";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { getFarmerStoryMessages } from "@/i18n/farmer-story";
import { getFarmerStageMessages } from "@/i18n/farmer-stage-ui";

type SuitabilityRow = ReturnType<typeof farmerSuitability>["top"][number];
type Context = ReturnType<typeof farmerDistrictContext>;
const format = (value:number,locale:Locale) => new Intl.NumberFormat(locale,{maximumFractionDigits:2}).format(value);

export function CropArtwork({code}:{code:CropCode}) {
  const drawings:Record<CropCode, ReactNode> = {
    KARTOSHKA:<><ellipse cx="32" cy="35" rx="21" ry="15" transform="rotate(-28 32 35)"/><path d="m23 29 2 1m10 12 2 1m6-13 2-1m-24 9 1 1m13-17 2 1"/></>,
    MOSH:<><path d="M13 43C9 18 32 6 51 14c4 25-17 43-38 29Z"/><path d="M17 42 46 17"/><ellipse cx="24" cy="31" rx="4" ry="6" transform="rotate(40 24 31)"/><ellipse cx="35" cy="23" rx="4" ry="6" transform="rotate(40 35 23)"/></>,
    LOVIYA:<><path d="M44 11c20 12 6 44-17 44C5 55 6 34 19 30c10-3 9-25 25-19Z"/><path d="M39 20c-9 4-6 17-17 20"/></>,
    PIYOZ:<><path d="M29 20C15 30 9 35 13 45c5 15 35 14 39 0 3-12-8-18-16-25M29 20l-5-12m12 12 5-12M31 20l2-14"/><path d="M30 23c-10 17-8 27 2 30m3-30c11 17 9 27-1 30"/></>,
    SABZI:<><path d="m25 23 17 7C37 42 22 55 15 57c0-13 4-26 10-34ZM30 24l3-15m4 18L50 15M34 25l9-18m-18 26 6 3m-11 6 6 3"/></>,
    KARAM:<><circle cx="32" cy="35" r="22"/><path d="M12 30c14-11 27 4 22 24M50 23c-19-4-29 11-27 29M22 15c20 12 8 26 28 30M11 39c6-2 13 1 16 7"/></>,
    POMIDOR:<><path d="M32 22C6 6 4 53 27 55c6 2 7 1 12 0 23-3 18-48-7-33Z"/><path d="m22 18 11 7 12-8-10-2-2-8-3 8-8 3m11 5-1 9"/></>,
    MAKKAJOXORI:<><path d="M27 11c18-5 22 26 9 39-15 6-25-28-9-39ZM15 29c-3 20 11 29 26 27M49 23c6 21-1 32-14 34"/><path d="m26 20 11-2m-14 10 16-2m-14 11 14-3m-10 11 9-3m-8-28 5 33"/></>,
  };
  return <svg className={`fsu-crop-art fsu-art-${code.toLowerCase()}`} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{drawings[code]}</svg>;
}

export function LandReasonCard({plot,result,locale,dictionary}:{plot:PresentationPlot;result:SuitabilityRow;locale:Locale;dictionary:Dictionary}) {
  const m=getFarmerStoryMessages(locale), n=getFarmerStageMessages(locale);
  const input=plot.scenario.inputs.plot;
  const soilExcluded=result.exclusions.includes("bonitet.belowMinimum");
  const waterExcluded=result.exclusions.includes("water.insufficient");
  const rotationExcluded=result.exclusions.includes("rotation.restricted");
  const soilSuitable=result.reasonKeys.includes("plot.bonitetSuitable");
  const rotationSuitable=result.reasonKeys.includes("plot.rotationSuitable");
  const conclusion=!result.eligible?n.landExcluded:result.partialWater||result.missingRotation||!soilSuitable||!rotationSuitable?n.landReview:n.landConclusion;
  return <section className={`fsu-reason fs-surface ${result.eligible?"":"has-restriction"}`} aria-labelledby="fsu-land-why" aria-live="polite">
    <div className="fsu-reason-heading"><span className="fsu-reason-symbol" aria-hidden="true">{result.eligible?"✓":"!"}</span><div><span className="fs-eyebrow">{dictionary.recommendation.cropNames[result.cropCode]}</span><h3 id="fsu-land-why">{result.eligible?n.whyLand:m.whyNot}</h3></div><span className="fs-badge">{m.demoConditions}</span></div>
    <div className="fsu-factor-grid">
      <article><span>{m.soil}</span><strong>{input.bonitet} {m.points} <small>· {soilExcluded?n.excluded:soilSuitable?n.compatible:n.review}</small></strong><p>{soilExcluded?m.soilExcluded:soilSuitable?n.soilExplain:n.soilReview}</p></article>
      <article><span>{dictionary.plot.waterSupply}</span><strong>{dictionary.creation.waterOptions[input.waterSupply]}</strong><p>{waterExcluded?m.waterExcluded:result.partialWater?m.partialWater:n.waterExplain}</p></article>
      <article><span>{n.previous}</span><strong>{dictionary.plotAnalytics.previousCrops[input.previousCrop]}</strong><p>{n.rotationExplain}</p></article>
      <article><span>{n.rotation}</span><strong>{rotationExcluded?n.excluded:result.missingRotation?m.unknown:rotationSuitable?n.compatible:n.review}</strong><p>{rotationExcluded?m.rotationExcluded:result.missingRotation?m.missingRotation:`${n.rotationScore}: ${result.rotationScore} / 100`}</p></article>
    </div>
    <div className="fsu-conclusion"><span>{n.conclusion}</span><p>{conclusion}</p></div><p className="fsu-source">{n.sourceLand}</p>
  </section>;
}

export function DistrictReasonCard({context,locale}:{context:Context;locale:Locale}) {
  const m=getFarmerStoryMessages(locale),n=getFarmerStageMessages(locale),p=context.product;
  if(!p)return null;
  const conclusion=p.balance===null?n.districtUnknown:p.balance>0?n.districtSurplus:p.balance<0?n.districtDeficit:n.districtBalanced;
  return <section className="fsu-reason fsu-district-reason fs-surface" aria-labelledby="fsu-district-why">
    <h3 id="fsu-district-why">{n.whyDistrict}</h3><dl className="fsu-result-metrics">
      <div><dt>{m.production}</dt><dd>{p.production===null?m.unknown:format(p.production,locale)} <small>{m.tons}</small></dd></div>
      <div><dt>{m.demand}</dt><dd>{format(p.need,locale)} <small>{m.tons}</small></dd></div>
      <div className={`fsu-result-balance ${p.balance!==null&&p.balance<0?"is-deficit":""}`}><dt>{m.balance}</dt><dd>{p.balance===null?m.unknown:p.balance===0?m.balanced:`${p.balance>0?"+":"−"}${format(Math.abs(p.balance),locale)} ${m.tons}`}</dd></div>
      <div className="fsu-result-coverage"><dt>{m.coverage}</dt><dd>{format(context.district.coverage,locale)}%</dd></div>
    </dl><div className="fsu-conclusion"><span>{n.conclusion}</span><p>{conclusion}</p></div><p className="fsu-source">{n.sourceDistrict} · {m.planned}: {format(p.plannedHa,locale)} {m.ha}</p>
  </section>;
}

export function MarketReasonCard({context,eligible,locale}:{context:Context;eligible:boolean;locale:Locale}) {
  const m=getFarmerStoryMessages(locale),n=getFarmerStageMessages(locale);
  const positive=context.product?.balance!==null&&context.product?.balance!==undefined&&context.product.balance>0;
  const hasDeficit=context.deficit!==null&&context.deficit>0;
  const opportunity=!!context.option&&positive&&hasDeficit&&eligible;
  return <section className="fsu-reason fsu-market-reason fs-surface" aria-labelledby="fsu-market-why">
    <h3 id="fsu-market-why">{n.whyMarket}</h3>
    <ul className="fsu-market-reasons">
      {positive?<li><span aria-hidden="true">✓</span><strong>{n.piskentSurplus}</strong><b>+{format(context.product!.balance!,locale)} {m.tons}</b></li>:null}
      {hasDeficit?<li><span aria-hidden="true">✓</span><strong>{n.bukaDeficit}</strong><b>−{format(context.deficit!,locale)} {m.tons}</b></li>:null}
      {opportunity?<li><span aria-hidden="true">↗</span><strong>{n.potential}</strong></li>:null}
    </ul>
    {!context.buka?<p className="fsu-missing-market">{m.noMarket}</p>:null}
    <div className="fsu-conclusion"><span>{n.recommendation}</span><p>{!eligible?n.landExcluded:opportunity?n.marketRecommendation:n.districtUnknown}</p></div>
    <p className="fsu-decision">{n.farmerDecision}</p><p className="fsu-source">{context.buka?n.sourceMarket:m.noMarket}</p>
  </section>;
}
