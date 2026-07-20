import { PrismaClient } from "@prisma/client";
import { PILOT_CADASTRAL_NUMBERS, PILOT_TAX_IDS } from "./seed-data/piskent-cadastre";

const prisma = new PrismaClient();

async function clearPilotData() {
  const result = await prisma.$transaction(async (transaction) => {
    const plots = await transaction.plot.deleteMany({
      where: { cadastralNumber: { in: PILOT_CADASTRAL_NUMBERS } },
    });
    const farms = await transaction.farm.deleteMany({
      where: { taxId: { in: PILOT_TAX_IDS }, plots: { none: {} } },
    });
    return { farms: farms.count, plots: plots.count };
  });

  console.info(`Cleared Piskent pilot data: ${result.farms} farms, ${result.plots} plots.`);
}

clearPilotData()
  .catch((error: unknown) => {
    console.error("Unable to clear Piskent pilot data.", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
