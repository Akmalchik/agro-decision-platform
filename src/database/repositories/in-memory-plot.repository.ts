import { TEST_PLOT } from "@/modules/plots/data/test-plot";
import type { PlotRepository } from "@/modules/plots/domain/plot-repository";

export const inMemoryPlotRepository: PlotRepository = {
  async findById(id) {
    return id === TEST_PLOT.id ? TEST_PLOT : null;
  },
};
