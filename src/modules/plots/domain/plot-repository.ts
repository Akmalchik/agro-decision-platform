import type { Plot } from "@/modules/plots/domain/plot";

export interface PlotRepository {
  findById(id: string): Promise<Plot | null>;
}
