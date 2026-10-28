// Isolated, internal presentation assumptions. Never persisted to the planning database.
// These values describe neither official Piskent statistics nor the six pilot plots.
export type RegionalProduct = { code: string; name: string; plannedHa: number; yieldTonsPerHa: number; consumptionKgPerPerson: number };
export type RegionalDistrict = { id: string; name: string; farms: number; totalHa: number; reportedHa: number; bonitet: number; water: string; demoPopulation: number; products: RegionalProduct[] };
export const regionalDemoDistricts: Record<string, RegionalDistrict> = {
  PISKENT: { id:"PISKENT", name:"Piskent tumani", farms:448, totalHa:20000, reportedHa:16600, bonitet:68, water:"O‘rtacha", demoPopulation:200000,
    products:[
      {code:"KARTOSHKA",name:"Kartoshka",plannedHa:1200,yieldTonsPerHa:24,consumptionKgPerPerson:140},
      {code:"PIYOZ",name:"Piyoz",plannedHa:900,yieldTonsPerHa:25,consumptionKgPerPerson:116},
      {code:"SABZI",name:"Sabzi",plannedHa:600,yieldTonsPerHa:30,consumptionKgPerPerson:90},
      {code:"BUGDOY",name:"Bug‘doy",plannedHa:8000,yieldTonsPerHa:5.5,consumptionKgPerPerson:210},
    ] },
};
export function coverageStatus(percent:number){
  if(!Number.isFinite(percent)||percent<0||percent>100)throw new Error("INVALID_COVERAGE");
  return percent===100?"To‘liq ma’lumot":percent>=95?"Yuqori qamrov":percent>=80?"Dastlabki prognoz":"Ma’lumotlar yig‘ilmoqda";
}
export function projectRegionalDistrict(district:RegionalDistrict){
  if(district.totalHa<=0||district.reportedHa<0||district.reportedHa>district.totalHa)throw new Error("INVALID_AREA");
  const coverage=district.reportedHa/district.totalHa*100;
  return {...district,coverage,status:coverageStatus(coverage),forecastReady:coverage>=80,unknownHa:district.totalHa-district.reportedHa,
    products:district.products.map(product=>{const production=product.plannedHa*product.yieldTonsPerHa;const need=district.demoPopulation*product.consumptionKgPerPerson/1000;return{...product,production:coverage>=80?production:null,need,balance:coverage>=80?production-need:null};})};
}
export function regionalContext(product?:string){return new URLSearchParams({from:"toshkent",district:"PISKENT",...(product&&regionalDemoDistricts.PISKENT.products.some(row=>row.code===product)?{product}: {})}).toString();}
export function regionalProductName(code?:string){return regionalDemoDistricts.PISKENT.products.find(product=>product.code===code)?.name;}
