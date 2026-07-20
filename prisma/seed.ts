import { Prisma, PrismaClient } from "@prisma/client";
import geometryData from "./seed-data/piskent-geometries.json";
import { PILOT_CADASTRAL_NUMBERS, PILOT_FARMS, PILOT_TAX_IDS } from "./seed-data/piskent-cadastre";

const prisma = new PrismaClient();

type GeometryRecord = (typeof geometryData)[number];
const geometryByCadastral = new Map<string, GeometryRecord>(
  geometryData.map((record) => [record.cadastralNumber, record]),
);

async function seedPilotData() {
  await prisma.$transaction(async (transaction) => {
    for (const farmData of PILOT_FARMS) {
      const farm = await transaction.farm.upsert({
        where: { taxId: farmData.taxId },
        create: { taxId: farmData.taxId, name: farmData.name },
        update: { name: farmData.name },
        select: { id: true },
      });

      for (const plot of farmData.plots) {
        const geometryRecord = geometryByCadastral.get(plot.cadastralNumber);
        const geometrySql = geometryRecord
          ? Prisma.sql`ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(geometryRecord.geometry)}::json), 4326)`
          : Prisma.sql`NULL`;
        const specialization = geometryRecord?.landType ?? null;

        await transaction.$executeRaw(Prisma.sql`
          INSERT INTO "plots" (
            "id", "cadastral_number", "farm_name", "owner", "area", "geometry",
            "specialization", "tax_id", "farm_id", "created_at"
          ) VALUES (
            ${crypto.randomUUID()}::uuid,
            ${plot.cadastralNumber},
            ${farmData.name},
            ${farmData.name},
            ${plot.officialAreaHectares}::numeric,
            ${geometrySql},
            ${specialization},
            ${farmData.taxId},
            ${farm.id}::uuid,
            CURRENT_TIMESTAMP
          )
          ON CONFLICT ("cadastral_number") DO UPDATE SET
            "farm_name" = EXCLUDED."farm_name",
            "owner" = EXCLUDED."owner",
            "area" = EXCLUDED."area",
            "geometry" = EXCLUDED."geometry",
            "specialization" = EXCLUDED."specialization",
            "tax_id" = EXCLUDED."tax_id",
            "farm_id" = EXCLUDED."farm_id"
        `);
      }
    }
  });

  const [farmCount, plotCount, geometryCount] = await Promise.all([
    prisma.farm.count({ where: { taxId: { in: PILOT_TAX_IDS } } }),
    prisma.plot.count({ where: { cadastralNumber: { in: PILOT_CADASTRAL_NUMBERS } } }),
    prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
      SELECT COUNT(*)::int AS "count"
      FROM "plots"
      WHERE "cadastral_number" IN (${Prisma.join(PILOT_CADASTRAL_NUMBERS)})
        AND "geometry" IS NOT NULL
    `),
  ]);

  if (farmCount !== 3 || plotCount !== 6 || geometryCount[0]?.count !== 3) {
    throw new Error(`Import verification failed: farms=${farmCount}, plots=${plotCount}, geometries=${geometryCount[0]?.count ?? 0}.`);
  }

  console.info("Piskent MVP data is ready: 3 farms, 6 cadastral plots, 3 KMZ geometries.");
}

seedPilotData()
  .catch((error: unknown) => {
    console.error("Unable to seed Piskent MVP data.", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
