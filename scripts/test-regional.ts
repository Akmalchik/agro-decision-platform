import assert from "node:assert/strict";
import { localeFromPathSegment } from "../src/i18n/config";
import { coverageStatus, projectRegionalDistrict, regionalContext, regionalDemoDistricts } from "../src/modules/regional/demo";
import map from "../src/modules/regional/data/toshkent-map.json";

assert.equal(localeFromPathSegment("uz"), "uz-Latn");
assert.equal(localeFromPathSegment("uz-latn"), "uz-Latn");
assert.equal(localeFromPathSegment("uz-cyrl"), "uz-Cyrl");
assert.equal(localeFromPathSegment("ru"), "ru");
for (const [value, expected] of [[0,"Ma’lumotlar yig‘ilmoqda"],[79,"Ma’lumotlar yig‘ilmoqda"],[80,"Dastlabki prognoz"],[94,"Dastlabki prognoz"],[95,"Yuqori qamrov"],[99,"Yuqori qamrov"],[100,"To‘liq ma’lumot"]] as const) assert.equal(coverageStatus(value), expected);
for (const value of [-1,101,NaN,Infinity]) assert.throws(() => coverageStatus(value));
const input=regionalDemoDistricts.PISKENT;
const original=JSON.stringify(input);
const result=projectRegionalDistrict(input);
assert.equal(result.farms,448);
assert.equal(result.coverage,83);
assert.equal(result.unknownHa,3400);
assert.deepEqual(result.products.map(row=>row.balance),[800,-700,0,2000]);
for(const row of result.products){
  assert.equal(row.production,row.plannedHa*row.yieldTonsPerHa);
  assert.equal(row.need,input.demoPopulation*row.consumptionKgPerPerson/1000);
}
const collecting=projectRegionalDistrict({...input,reportedHa:15800});
assert.equal(collecting.forecastReady,false);
assert.ok(collecting.products.every(row=>row.production===null&&row.balance===null));
assert.equal(JSON.stringify(input),original);
assert.throws(()=>projectRegionalDistrict({...input,reportedHa:20001}));
assert.equal(map.districts.filter(row=>row.kind==="district").length,15);
assert.equal(map.districts.filter(row=>row.kind==="city").length,7);
assert.equal(map.districts.filter(row=>row.id==="PISKENT").length,1);
assert.ok(map.districts.every(row=>row.path.startsWith("M")&&row.path.endsWith("Z")));
assert.equal(map.source.year,"2020");
assert.equal(map.source.license,"CC BY 3.0 IGO");
assert.deepEqual(Object.keys(regionalDemoDistricts),["PISKENT"]);
assert.equal(new URLSearchParams(regionalContext("KARTOSHKA")).get("product"),"KARTOSHKA");
assert.equal(new URLSearchParams(regionalContext("<script>")).has("product"),false);
console.info("Regional DEMO passed: locale aliases, coverage boundaries, transparent formulas, no mutation, map provenance and safe context.");
