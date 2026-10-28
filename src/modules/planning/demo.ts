import type { DemandEvidence, PlotScope, Submission, YieldEvidence } from "./domain";
import { proposeTransfers } from "./logistics";

// Explicit presentation fixtures, independent of official statistics and farmer submissions.
export function demoEvidence() {
  const yields: YieldEvidence[] = [
    { crop: "MOSH", tonsPerHa: 168 / 380, season: "2025", source: "DEMO: 168 t / 380 ha (existing presentation dataset)" },
    { crop: "LOVIYA", tonsPerHa: 158 / 330, season: "2025", source: "DEMO: 158 t / 330 ha (existing presentation dataset)" },
    { crop: "MAKKAJOXORI", tonsPerHa: 315 / 520, season: "2025", source: "DEMO: 315 t / 520 ha (existing presentation dataset)" },
  ];
  const demand: DemandEvidence[] = [
    { crop: "MOSH", tons: 240, source: "DEMO: existing Piskent presentation" },
    { crop: "LOVIYA", tons: 210, source: "DEMO: existing Piskent presentation" },
    { crop: "MAKKAJOXORI", tons: 390, source: "DEMO: existing Piskent presentation" },
  ];
  return { yields, demand };
}
export function demoSubmissions(plots: PlotScope[], season: string): Submission[] {
  return plots.map((plot) => ({ plotId: plot.id, season, mode: "DEMO", revision: 0, updatedAt: "2026-01-01T00:00:00.000Z",
    allocations: [{ crop: "MOSH", area: plot.area * 0.8, market: "UNKNOWN" }] }));
}

export function interdistrictOptions(rows: Array<{ crop: string; surplus: number | null }>, mode: "DEMO" | "USER_PLAN") {
  // Hypothetical neighboring balance solely for presenting the workflow. No route is fabricated.
  const neighbors = mode === "DEMO" ? [{ district: "BUKA", crop: "MOSH", production: 130, demand: 180, source: "DEMO: hypothetical neighboring balance, not Buka statistics" }] : [];
  return proposeTransfers("PISKENT", rows, neighbors, [], []);
}
