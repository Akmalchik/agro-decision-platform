import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
const url = process.env.DATABASE_URL ?? "";
if (!url.includes("@127.0.0.1:55437/smart_ekin_test")) throw new Error("Tests require the isolated smart_ekin_test database on localhost:55437");
const base = "http://127.0.0.1:3107";
const key = "isolated-local-test-operator-key-20261028";
const headers = { "Content-Type": "application/json", Authorization: `Bearer ${key}` };
const db = new PrismaClient();
async function get(path: string) { const response = await fetch(base + path, { headers }); return { response, payload: await response.json() }; }
async function post(path: string, body: unknown, authorization = true) {
  const response = await fetch(base + path, { method: "POST", headers: authorization ? headers : { "Content-Type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) });
  return { response, payload: await response.json() };
}
async function main() {
  for (const path of ["/api/plots", "/api/recommendations/first-stage", "/api/planning"]) {
    assert.equal((await post(path, {} , false)).response.status, 401);
    assert.equal((await post(path, "{")).response.status, 400);
    assert.equal((await post(path, {})).response.status, 400);
  }
  assert.equal((await post("/api/plots/geometry", "{")).response.status, 400);
  const initial = await get("/api/planning?season=2027&mode=DEMO");
  assert.equal(initial.response.status, 200);
  assert.equal(initial.payload.data.plots.length, 6);
  assert.ok(Math.abs(initial.payload.data.forecast.coverage - 80) < 0.000001);
  const plot = initial.payload.data.plots[0];
  const season = "2098";
  const input = { plotId: plot.id, season, mode: "USER_PLAN", revision: 0, allocations: [{ crop: "MOSH", area: plot.area, market: "CONTRACT" }] };
  const existing = await get(`/api/planning?season=${season}&mode=USER_PLAN`);
  input.revision = existing.payload.data.submissions.find((row: { plotId: string }) => row.plotId === plot.id)?.revision ?? 0;
  const beforeCounts = { plots: await db.plot.count(), farms: await db.farm.count() };
  const first = await post("/api/planning", input);
  assert.equal(first.response.status, 200);
  const after = await get(`/api/planning?season=${season}&mode=USER_PLAN`);
  assert.equal(after.payload.data.submissions.find((row: { plotId: string }) => row.plotId === plot.id).allocations[0].market, "CONTRACT");
  assert.equal(after.payload.data.forecast.coveredArea, plot.area);
  assert.equal((await post("/api/planning", input)).response.status, 409);
  assert.equal((await post("/api/planning", { ...input, revision: first.payload.data.revision, allocations: [{ crop: "MOSH", area: plot.area + 1 }] })).response.status, 422);
  assert.equal((await post("/api/planning", { ...input, revision: first.payload.data.revision, allocations: [{ crop: "MOSH", area: plot.area + 1, market: "UNKNOWN" }] })).response.status, 422);
  const update = await post("/api/planning", { ...input, revision: first.payload.data.revision, allocations: [{ crop: "MOSH", area: plot.area / 2, market: "EXPORT" }] });
  assert.equal(update.response.status, 200);
  const updated = await get(`/api/planning?season=${season}&mode=USER_PLAN`);
  assert.equal(updated.payload.data.forecast.coveredArea, plot.area / 2);
  assert.equal(await db.plot.count(), beforeCounts.plots);
  assert.equal(await db.farm.count(), beforeCounts.farms);
  const noGeometry = await db.plot.findFirstOrThrow({ where: { cadastralNumber: "11:10:000000613" } });
  assert.equal((await fetch(`${base}/ru/plot/${noGeometry.id}`)).status, 200);
  const polygon = { type: "Polygon", coordinates: [[[69.3, 40.8], [69.301, 40.8], [69.301, 40.801], [69.3, 40.8]]] };
  assert.equal((await post("/api/plots/geometry", polygon)).response.status, 200);
  const created = await post("/api/plots", { geometry: polygon, cadastralNumber: `test-${Date.now()}`, taxId: "test-isolated", farmName: "Isolated verification", bonitet: 70, waterSupply: "LOW", previousCrop: "OTHER" });
  assert.equal(created.response.status, 201);
  const recommendation = await post("/api/recommendations/first-stage", { plotId: created.payload.data.id });
  assert.equal(recommendation.response.status, 200);
  assert.ok(recommendation.payload.data.excluded.some((row: { reasons: string[] }) => row.reasons.includes("water.insufficient")));
  assert.ok(recommendation.payload.data.items.every((row: { rotationScore: number | null }) => row.rotationScore === null));
  assert.equal(await db.recommendation.count({ where: { plotId: created.payload.data.id } }), 1);
  for (const locale of ["ru", "uz-latn", "uz-cyrl"]) for (const page of ["", "/map", "/planning"]) assert.equal((await fetch(base + "/" + locale + page)).status, 200);
  console.info("Isolated PostGIS integration passed: auth, malformed JSON, all locales, map geometry, nullable geometry, plan persistence/revision/area checks, forecast recalculation and recommendation history.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
