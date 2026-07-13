import type { PlotRepository } from "@/modules/plots/domain/plot-repository";

export class PlotService {
  constructor(private readonly plots: PlotRepository) {}

  getById(id: string) {
    return this.plots.findById(id);
  }
}
