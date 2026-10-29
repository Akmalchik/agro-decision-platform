import assert from "node:assert/strict";
import {calculateMvpMultiStageRecommendations} from "../src/modules/recommendations/domain/mvp-multi-stage-rule-engine";
import {projectEvolution,evolvingScenario} from "../src/modules/presentation/evolving-scenario";
import type {PresentationPlot} from "../src/modules/presentation/projection";
import {getDecisionMessages} from "../src/i18n/decision-surface";
const plot:PresentationPlot={id:"pilot",farmId:"farm",farmName:"G'ALABA CLUSTER",area:90.04,cadastralNumber:"11:10:000234163",facts:{bonitet:null,waterSupply:null,previousCrop:null},bounds:null,scenario:{cadastralNumber:"11:10:000234163",stage:"FIRST_STAGE",inputs:{plot:{bonitet:68,waterSupply:"MEDIUM",previousCrop:"BUGDOY",officialAreaHectares:90.04}},recommendations:[]}};
const original=JSON.stringify({plot,evolvingScenario});
const outputs=([1,3,4] as const).map(stage=>projectEvolution(plot,stage));
assert.deepEqual(outputs.map(x=>x.top.map(r=>[r.code,r.score])),[[["MOSH",100],["PIYOZ",96],["KARAM",82]],[["KARTOSHKA",92],["MOSH",87],["PIYOZ",83]],[["MOSH",97],["KARAM",70],["PIYOZ",67]]]);
const engine=calculateMvpMultiStageRecommendations(plot.scenario);
for(const row of outputs[0].all){assert.equal(row.score,engine.find(x=>x.cropCode===row.code)?.score);assert.equal(row.evidence,null);assert.equal(row.balance,null);}
for(const result of outputs.slice(1)){
  assert.equal(result.coverage,result.reportedArea/result.totalArea*100);
  assert.equal(result.unknownArea,result.totalArea-result.reportedArea);
  for(const row of result.all){const e=row.evidence!;assert.equal(row.balance,e.production-e.demand);assert.equal(row.deficit,Math.max(0,e.demand-e.production));assert.equal(row.deficitPercent,row.deficit!/e.demand*100);assert.equal(row.supplyPercent,e.production/e.demand*100);assert.equal(row.neighborDeficit,Math.max(0,e.neighborDemand-e.neighborProduction));assert.ok(e.price[0]<=e.price[1]);assert.ok(row.score>=0&&row.score<=100);}
}
assert.deepEqual(outputs.map(x=>x.coverage),[0,83,98]);
assert.equal(outputs[1].top[0].rankDelta,3);
assert.equal(outputs[2].top[0].deficit,42);
assert.equal(outputs[2].top[0].neighborDeficit,300);
assert.equal(outputs[2].top[1].balance,140);
assert.equal(outputs[2].top[2].deficitPercent,6.25);
const noWater=projectEvolution({...plot,scenario:{...plot.scenario,inputs:{plot:{...plot.scenario.inputs.plot,waterSupply:"LOW"}}}},4);
assert.ok(!noWater.all.some(row=>row.code==="KARTOSHKA"||row.code==="KARAM"),"Presentation ranking must never override hard production eligibility");
assert.equal(JSON.stringify({plot,evolvingScenario}),original);
assert.equal(evolvingScenario.official,false);
for(const locale of ["uz-Latn","uz-Cyrl","ru"] as const){const n=getDecisionMessages(locale);assert.equal(Object.keys(n).length,Object.keys(getDecisionMessages("uz-Latn")).length);assert.ok(!Object.values(n).some(v=>/demo|AI SCORE/i.test(v)));}
console.info("Evolution scenario passed: unchanged agronomy base, eligibility, stage-specific weighted ranking, coverage/area, all balances/percentages, prices/neighbor scenarios, provenance and locale completeness.");
