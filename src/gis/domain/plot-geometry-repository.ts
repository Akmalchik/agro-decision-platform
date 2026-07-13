import type { PlotGeometry } from "@/gis/domain/geometry";

export interface PlotGeometryRepository {
  findByPlotId(plotId: string): Promise<PlotGeometry | null>;
}
