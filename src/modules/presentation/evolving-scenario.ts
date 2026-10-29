import type { PresentationPlot } from "./projection";
import { calculateMvpMultiStageRecommendations } from "@/modules/recommendations/domain/mvp-multi-stage-rule-engine";

export type AnalysisLevel=1|3|4;
export type ScenarioCrop="MOSH"|"KARAM"|"PIYOZ"|"KARTOSHKA";
type Evidence={demand:number;production:number;price:[number,number];neighborDemand:number;neighborProduction:number;exportPotential:boolean;marketSupport:number};
// Isolated illustrative scenario, NEVER official statistics, live prices or farmer plans.
// It is deliberately not registered with production recommendation/planning services.
export const evolvingScenario={
  id:"presentation-evolution-20261029",provenance:"INTERNAL_DEMONSTRATION",official:false,
  marketSupportMeaning:"Illustrative composite outlook assumption (0–100): prices, neighboring need and export potential; not calibrated and not confidence",
  totalArea:20000,reportedArea:{1:0,3:16600,4:19600},
  scoring:{3:{agronomy:.4,district:.6},4:{agronomy:.4,district:.3,market:.3}},
  districtOpportunity:{neutral:70,percentagePointMultiplier:4},
  evidence:{
    3:{
      MOSH:{demand:180,production:176,price:[18000,22000],neighborDemand:800,neighborProduction:500,exportPotential:true,marketSupport:90},
      KARAM:{demand:1200,production:1230,price:[2200,2800],neighborDemand:900,neighborProduction:500,exportPotential:true,marketSupport:100},
      PIYOZ:{demand:160,production:158,price:[3000,3800],neighborDemand:300,neighborProduction:300,exportPotential:false,marketSupport:0},
      KARTOSHKA:{demand:18200,production:15400,price:[4000,5000],neighborDemand:7000,neighborProduction:6300,exportPotential:false,marketSupport:40},
    },
    4:{
      MOSH:{demand:180,production:138,price:[18000,22000],neighborDemand:800,neighborProduction:500,exportPotential:true,marketSupport:90},
      KARAM:{demand:1200,production:1340,price:[2200,2800],neighborDemand:900,neighborProduction:500,exportPotential:true,marketSupport:100},
      PIYOZ:{demand:160,production:150,price:[3000,3800],neighborDemand:300,neighborProduction:300,exportPotential:false,marketSupport:0},
      KARTOSHKA:{demand:18200,production:19000,price:[4000,5000],neighborDemand:7000,neighborProduction:6300,exportPotential:false,marketSupport:40},
    },
  } satisfies Record<3|4,Record<ScenarioCrop,Evidence>>,
} as const;
const cropCodes:ScenarioCrop[]=["MOSH","KARAM","PIYOZ","KARTOSHKA"];
const clamp=(value:number)=>Math.max(0,Math.min(100,value));
export function projectEvolution(plot:PresentationPlot,level:AnalysisLevel){
  const agro=calculateMvpMultiStageRecommendations({...plot.scenario,stage:"FIRST_STAGE"});
  function rank(stage:AnalysisLevel){
    return cropCodes.map(code=>{
      const agronomy=agro.find(row=>row.cropCode===code)!;
      const evidence=stage===1?null:evolvingScenario.evidence[stage][code];
      const balance=evidence?evidence.production-evidence.demand:null;
      const deficit=evidence?Math.max(0,evidence.demand-evidence.production):null;
      const deficitPercent=evidence?deficit!/evidence.demand*100:null;
      const supplyPercent=evidence?evidence.production/evidence.demand*100:null;
      const districtIndex=evidence?clamp(evolvingScenario.districtOpportunity.neutral+evolvingScenario.districtOpportunity.percentagePointMultiplier*(evidence.demand-evidence.production)/evidence.demand*100):null;
      const weights=stage===1?null:evolvingScenario.scoring[stage];
      const score=stage===1?agronomy.score:stage===3?Math.round(agronomy.score*weights!.agronomy+districtIndex!*weights!.district):Math.round(agronomy.score*weights!.agronomy+districtIndex!*weights!.district+evidence!.marketSupport*evolvingScenario.scoring[4].market);
      return {code,agronomy,evidence,balance,deficit,deficitPercent,supplyPercent,districtIndex,score,neighborDeficit:evidence?Math.max(0,evidence.neighborDemand-evidence.neighborProduction):null};
    }).filter(row=>row.agronomy.eligible).sort((a,b)=>b.score-a.score||b.agronomy.score-a.agronomy.score||a.code.localeCompare(b.code));
  }
  const previous=level===1?[]:rank(level===3?1:3);
  const all=rank(level).map((row,index)=>{
    const prior=previous.findIndex(item=>item.code===row.code);
    return {...row,rank:index+1,previousRank:prior<0?null:prior+1,rankDelta:prior<0?null:prior-index,previousScore:prior<0?null:previous[prior].score};
  });
  return {level,coverage:evolvingScenario.reportedArea[level]/evolvingScenario.totalArea*100,reportedArea:evolvingScenario.reportedArea[level],totalArea:evolvingScenario.totalArea,unknownArea:evolvingScenario.totalArea-evolvingScenario.reportedArea[level],all,top:all.slice(0,3),provenance:evolvingScenario.provenance};
}
