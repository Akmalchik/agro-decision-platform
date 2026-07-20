import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const TARGET_CADASTRALS = new Set([
  "11:10:000000612",
  "11:10:000172582",
  "11:10:000005739",
]);

const kmzPath = process.argv[2];
const outputPath = resolve(process.argv[3] ?? "prisma/seed-data/piskent-geometries.json");

if (!kmzPath) throw new Error("Usage: npm run data:extract:kmz -- <file.kmz> [output.json]");

const kml = execFileSync("unzip", ["-p", resolve(kmzPath), "doc.kml"], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
const placemarks = kml.match(/<Placemark\b[\s\S]*?<\/Placemark>/g) ?? [];

function field(placemark: string, key: string): string | null {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return placemark.match(new RegExp(`<td>${escapedKey}<\\/td>\\s*<td>([^<]+)<\\/td>`))?.[1]?.trim() ?? null;
}

function coordinates(placemark: string): [number, number][] {
  const blocks = [...placemark.matchAll(/<Polygon>[\s\S]*?<outerBoundaryIs>[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>[\s\S]*?<\/outerBoundaryIs>[\s\S]*?<\/Polygon>/g)];
  if (blocks.length !== 1 || !blocks[0]?.[1]) throw new Error("Each target cadastral must contain exactly one Polygon.");

  const ring = blocks[0][1].trim().split(/\s+/).map((coordinate) => {
    const [longitude, latitude] = coordinate.split(",").map(Number);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) throw new Error(`Invalid coordinate: ${coordinate}`);
    return [longitude, latitude] as [number, number];
  });

  const first = ring[0];
  const last = ring.at(-1);
  if (!first || !last || first[0] !== last[0] || first[1] !== last[1]) throw new Error("Polygon ring is not closed.");
  return ring;
}

const geometries = placemarks.flatMap((placemark) => {
  const cadastralNumber = field(placemark, "cadastral_");
  if (!cadastralNumber || !TARGET_CADASTRALS.has(cadastralNumber)) return [];

  return [{
    cadastralNumber,
    landTypeCode: field(placemark, "property_k"),
    landType: field(placemark, "land_fun_1"),
    geometry: { type: "Polygon" as const, coordinates: [coordinates(placemark)] },
  }];
});

const found = new Set(geometries.map((item) => item.cadastralNumber));
const missing = [...TARGET_CADASTRALS].filter((cadastralNumber) => !found.has(cadastralNumber));
if (missing.length > 0 || geometries.length !== TARGET_CADASTRALS.size) {
  throw new Error(`KMZ target mismatch. Missing: ${missing.join(", ") || "none"}.`);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(geometries, null, 2)}\n`, "utf8");
console.info(`Extracted ${geometries.length} target geometries to ${outputPath}. KMZ area fields were ignored.`);
