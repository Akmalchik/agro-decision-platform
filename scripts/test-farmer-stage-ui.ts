import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LandReasonCard, DistrictReasonCard, MarketReasonCard } from "../src/components/presentation/farmer-stage-cards";
import { farmerSuitability, farmerDistrictContext } from "../src/modules/presentation/farmer-story";
import { piskentMvpRecommendationScenarioSource as source } from "../src/modules/recommendations/data/piskent-mvp-recommendation-scenarios";
import type { PresentationPlot } from "../src/modules/presentation/projection";
import { getDictionary } from "../src/i18n";
import { getFarmerStageMessages } from "../src/i18n/farmer-stage-ui";

const scenario=source.findByCadastralNumber("11:10:000005739")!;
const plot:PresentationPlot={id:"pilot",farmId:"farm",farmName:"Pilot",area:40.4,cadastralNumber:scenario.cadastralNumber,scenario,bounds:null,facts:{bonitet:null,waterSupply:null,previousCrop:null}};
const suitability=farmerSuitability(plot);
const potato=[...suitability.top,...suitability.additional].find(row=>row.cropCode==="KARTOSHKA")!;
const initial=JSON.stringify(plot);
for(const locale of ["uz-Latn","uz-Cyrl","ru"] as const){
  const n=getFarmerStageMessages(locale),dictionary=getDictionary(locale);
  const html=renderToStaticMarkup(createElement(LandReasonCard,{plot,result:potato,locale,dictionary}));
  assert.ok(html.includes(String(scenario.inputs.plot.bonitet)));
  assert.ok(html.includes(dictionary.creation.waterOptions[scenario.inputs.plot.waterSupply]));
  assert.ok(html.includes(String(potato.rotationScore)));
  assert.ok(html.includes(n.landConclusion));
  assert.equal(Object.keys(n).length,Object.keys(getFarmerStageMessages("uz-Latn")).length);
  assert.ok(Object.values(n).every(value=>value.length>0));
  for(const [crop,conclusion] of [["KARTOSHKA",n.districtSurplus],["PIYOZ",n.districtDeficit],["SABZI",n.districtBalanced]] as const){
    const context=farmerDistrictContext(crop);
    const district=renderToStaticMarkup(createElement(DistrictReasonCard,{context,locale}));
    assert.ok(district.includes(conclusion),crop);
    assert.ok(district.includes("83%"));
  }
  const context=farmerDistrictContext("KARTOSHKA");
  const unknown={...context,product:{...context.product!,production:null,balance:null}};
  assert.ok(renderToStaticMarkup(createElement(DistrictReasonCard,{context:unknown,locale})).includes(n.districtUnknown));
  assert.equal(renderToStaticMarkup(createElement(DistrictReasonCard,{context:farmerDistrictContext("MOSH"),locale})),"");
  const market=renderToStaticMarkup(createElement(MarketReasonCard,{context,eligible:true,locale}));
  assert.ok(market.includes(n.piskentSurplus));assert.ok(market.includes(n.bukaDeficit));
  assert.ok(market.includes(n.marketRecommendation));assert.ok(market.includes(n.farmerDecision));
  const excludedMarket=renderToStaticMarkup(createElement(MarketReasonCard,{context,eligible:false,locale}));
  assert.ok(!excludedMarket.includes(n.marketRecommendation));assert.ok(excludedMarket.includes(n.landExcluded));
}
const dryPlot={...plot,scenario:{...scenario,inputs:{plot:{...scenario.inputs.plot,waterSupply:"LOW" as const}}}};
const excluded=farmerSuitability(dryPlot).excluded.find(row=>row.cropCode==="KARTOSHKA")!;
const html=renderToStaticMarkup(createElement(LandReasonCard,{plot:dryPlot,result:excluded,locale:"uz-Latn",dictionary:getDictionary("uz-Latn")}));
assert.ok(html.includes("Suv yetarli emas"));assert.ok(html.includes(getFarmerStageMessages("uz-Latn").landExcluded));
assert.equal(JSON.stringify(plot),initial,"UI rendering must not alter inputs");
console.info("Farmer stage UI passed: factual soil/water/rotation, exclusions, balance-dependent conclusions, absent forecasts, conditional market advice, all languages and immutable inputs.");
