import { PrismaClient } from "@prisma/client";
import { TEST_PLOT_GEOMETRY } from "../src/gis/data/test-plot-geometry";
import { TEST_PLOT } from "../src/modules/plots/data/test-plot";

const prisma = new PrismaClient();

async function seedTestPlot() {
  const geometry = JSON.stringify(TEST_PLOT_GEOMETRY);

  await prisma.$transaction(async (transaction) => {
    await transaction.$executeRaw`
      INSERT INTO "plots" (
        "id",
        "cadastral_number",
        "farm_name",
        "owner",
        "area",
        "geometry",
        "specialization",
        "created_at"
      ) VALUES (
        ${TEST_PLOT.id}::uuid,
        ${TEST_PLOT.cadastralNumber},
        ${TEST_PLOT.farmName},
        ${TEST_PLOT.owner},
        ${TEST_PLOT.area}::numeric,
        ST_SetSRID(ST_GeomFromGeoJSON(${geometry}::json), 4326),
        ${TEST_PLOT.specialization},
        ${TEST_PLOT.createdAt}
      )
      ON CONFLICT ("id") DO UPDATE SET
        "cadastral_number" = EXCLUDED."cadastral_number",
        "farm_name" = EXCLUDED."farm_name",
        "owner" = EXCLUDED."owner",
        "area" = EXCLUDED."area",
        "geometry" = EXCLUDED."geometry",
        "specialization" = EXCLUDED."specialization"
    `;

    if (TEST_PLOT.soilProfile) {
      await transaction.$executeRaw`
        INSERT INTO "soil_profiles" ("id", "plot_id", "bonitet")
        VALUES (
          ${TEST_PLOT.soilProfile.id}::uuid,
          ${TEST_PLOT.id}::uuid,
          ${TEST_PLOT.soilProfile.bonitet}::numeric
        )
        ON CONFLICT ("plot_id") DO UPDATE SET
          "bonitet" = EXCLUDED."bonitet"
      `;
    }
  });
}

seedTestPlot()
  .then(() => console.info(`Test plot ${TEST_PLOT.id} is ready.`))
  .catch((error: unknown) => {
    console.error("Unable to seed the test plot.", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
