import type { PlotRepository } from "@/modules/plots/domain/plot-repository";
import type { PlotWriteRepository } from "@/modules/plots/domain/plot-write-repository";
import type { PlotLookupMethod, PlotLookupSource } from "@/modules/plots/domain/plot-lookup-source";

export class PlotService {
  constructor(
    private readonly plots: PlotRepository,
    private readonly plotWriter: PlotWriteRepository,
    private readonly plotLookup: PlotLookupSource,
  ) {}

  getById(id: string) {
    return this.plots.findById(id);
  }

  inspectGeometry(geometry: Parameters<PlotWriteRepository["inspectGeometry"]>[0]) {
    return this.plotWriter.inspectGeometry(geometry);
  }

  getGeometryById(id: string) {
    return this.plotWriter.findGeometryById(id);
  }

  create(input: Parameters<PlotWriteRepository["create"]>[0]) {
    return this.plotWriter.create(input);
  }

  lookup(method: PlotLookupMethod, value: string) {
    return this.plotLookup.find(method, value);
  }
}
