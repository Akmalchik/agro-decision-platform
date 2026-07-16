import { PrismaClient } from "@prisma/client";
import { TEST_PLOT_ID } from "../src/modules/plots/data/test-plot";

const prisma = new PrismaClient();

async function clearTestPlot() {
  const deleted = await prisma.$executeRaw`
    DELETE FROM "plots"
    WHERE "id" = ${TEST_PLOT_ID}::uuid
  `;

  console.info(`Deleted test plots: ${deleted}.`);
}

clearTestPlot()
  .catch((error: unknown) => {
    console.error("Unable to clear the test plot.", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
