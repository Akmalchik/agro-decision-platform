import assert from "node:assert/strict";
import { evaluateCrop } from "../src/modules/recommendations/domain/eligibility";
import { forecastDistrict, validatePlanArea, planSchema, estimateResources, type PlotScope, type Submission } from "../src/modules/planning/domain";
import { HttpError, readJson, requireWriter } from "../src/api/http";
import { z } from "zod";
import { proposeTransfers } from "../src/modules/planning/logistics";

async function main() {
const crop = { id: "x", code: "KARAM" as const, minBonitet: 45, optimalBonitetMin: 60, optimalBonitetMax: 85, waterNeed: "HIGH" as const };
assert.deepEqual(evaluateCrop(70, "LOW", crop).exclusions, ["water.insufficient"]);
assert.equal(evaluateCrop(70, "MEDIUM", crop).eligible, true);
assert.equal(evaluateCrop(44, "HIGH", crop).eligible, false);
assert.equal(evaluateCrop(45, "HIGH", crop).eligible, true);
assert.equal(evaluateCrop(70, "HIGH", crop).rotationScore, null);
assert.equal(evaluateCrop(70, "HIGH", crop).score, 100);
assert.equal(evaluateCrop(70, "HIGH", crop, { nextCropCode: "KARAM", compatibilityScore: 100, status: "RESTRICTED", explanationKey: "rotation.restricted" }).eligible, false);
assert.throws(() => evaluateCrop(NaN, "HIGH", crop));
assert.deepEqual(estimateResources(10, 2, 1000), { expectedTons: 20, requiredWaterM3: 10000 });
assert.deepEqual(estimateResources(10, null, null), { expectedTons: null, requiredWaterM3: null });
const plots: PlotScope[] = [{ id: "00000000-0000-4000-8000-000000000001", cadastralNumber: "a", farmName: "farm", farmId: "farm", area: 100 }];
const submission = (area: number, revision = 1): Submission => ({ plotId: plots[0].id, season: "2027", mode: "USER_PLAN", revision, allocations: [{ crop: "MOSH", area, market: "EXPORT" }], updatedAt: new Date().toISOString() });
const calculate = (rows: Submission[]) => forecastDistrict(plots, rows, "2027", "USER_PLAN", [], []);
assert.equal(calculate([submission(79.99)]).ready, false);
assert.equal(calculate([submission(80)]).ready, true);
assert.equal(calculate([submission(80)]).unknownArea, 20);
assert.equal(calculate([submission(70), submission(80, 2), submission(80, 2)]).coveredArea, 80);
assert.equal(calculate([{ ...submission(100), season: "2026" }]).coverage, 0);
assert.equal(calculate([{ ...submission(100), mode: "DEMO" }]).coverage, 0);
assert.equal(calculate([submission(80)]).rows.find((row) => row.crop === "MOSH")?.production, null);
assert.throws(() => validatePlanArea(submission(101), plots[0]));
assert.equal(planSchema.safeParse({ ...submission(80), allocations: [...submission(80).allocations, ...submission(1).allocations] }).success, false);
const evidence = [{ crop: "MOSH", tonsPerHa: 2, source: "district", season: "2025" }, { crop: "MOSH", farmId: "farm", tonsPerHa: 3, source: "farm", season: "2026" }];
const result = forecastDistrict(plots, [submission(80)], "2027", "USER_PLAN", evidence, [{ crop: "MOSH", tons: 200, source: "test" }]);
const mosh = result.rows.find((row) => row.crop === "MOSH")!;
assert.equal(mosh.production, 240);
assert.equal(mosh.surplus, 40);
assert.equal(mosh.marketArea.EXPORT, 80); // Intention does not subtract unconfirmed export sales.
assert.deepEqual(mosh.sources, ["farm"]);
const logistics = proposeTransfers("PISKENT", [{ crop: "MOSH", surplus: 100 }],
  [{ district: "BUKA", crop: "MOSH", production: 20, demand: 90, source: "test" }, { district: "OTHER", crop: "MOSH", production: 0, demand: 100, source: "test" }],
  [{ from: "PISKENT", to: "BUKA", kilometers: 20, minutes: 30, source: "route-test" }, { from: "PISKENT", to: "OTHER", kilometers: 50, minutes: 60, source: "route-test" }],
  [{ from: "PISKENT", to: "EXPORT", crop: "MOSH", tons: 10, confirmed: true }]);
assert.equal(logistics[0].destination, "BUKA");
assert.equal(logistics[0].proposedTons, 70);
assert.equal(logistics.reduce((sum, row) => sum + (row.proposedTons ?? 0), 0), 90);
assert.equal(proposeTransfers("PISKENT", [{ crop: "MOSH", surplus: 100 }], [{ district: "BUKA", crop: "MOSH", production: 0, demand: 10, source: "test" }], [], [])[0].proposedTons, null);
assert.equal(forecastDistrict(plots, [submission(80)], "2027", "USER_PLAN", evidence.slice(0, 1), []).rows.find((row) => row.crop === "MOSH")?.production, 160);
assert.equal(forecastDistrict(plots, [submission(80)], "2027", "USER_PLAN", [{ ...evidence[0], season: "2027" }], []).rows.find((row) => row.crop === "MOSH")?.production, null);
const oldKey = process.env.WRITE_ACCESS_KEY;
process.env.WRITE_ACCESS_KEY = "a".repeat(64);
assert.throws(() => requireWriter(new Request("http://localhost/api")), (e) => e instanceof HttpError && e.status === 401);
requireWriter(new Request("http://localhost/api", { headers: { Authorization: `Bearer ${process.env.WRITE_ACCESS_KEY}` } }));
assert.throws(() => requireWriter(new Request("http://localhost/api", { headers: { Authorization: `Bearer ${process.env.WRITE_ACCESS_KEY}`, Origin: "https://evil.example" } })), (e) => e instanceof HttpError && e.status === 403);
delete process.env.WRITE_ACCESS_KEY;
assert.throws(() => requireWriter(new Request("http://localhost/api")), (e) => e instanceof HttpError && e.status === 503);
if (oldKey) process.env.WRITE_ACCESS_KEY = oldKey;
await assert.rejects(readJson(new Request("http://localhost", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" }), z.object({})), (e) => e instanceof HttpError && e.status === 400);
await assert.rejects(readJson(new Request("http://localhost", { method: "POST", headers: { "Content-Type": "application/json" }, body: "a".repeat(1000001) }), z.object({})), (e) => e instanceof HttpError && e.status === 413);
console.info("Modernization: eligibility, missing evidence, resources, area coverage, deduplication, yield precedence, market intentions, authorization and JSON tests passed.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
