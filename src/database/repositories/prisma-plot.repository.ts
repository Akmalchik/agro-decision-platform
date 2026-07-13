import { prisma } from "@/database/prisma";
import type { PlotRepository } from "@/modules/plots/domain/plot-repository";

export const prismaPlotRepository: PlotRepository = {
  async findById(id) {
    const plot = await prisma.plot.findUnique({
      where: { id },
      select: {
        id: true,
        cadastralNumber: true,
        farmName: true,
        owner: true,
        area: true,
        specialization: true,
        createdAt: true,
        soilProfile: {
          select: { id: true, plotId: true, bonitet: true },
        },
      },
    });

    return plot
      ? {
          ...plot,
          area: plot.area.toString(),
          soilProfile: plot.soilProfile
            ? { ...plot.soilProfile, bonitet: plot.soilProfile.bonitet?.toString() ?? null }
            : null,
        }
      : null;
  },
};
