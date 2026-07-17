import type { PlotLookupSource } from "@/modules/plots/domain/plot-lookup-source";

const TEST_REGISTRY_RECORD = {
  cadastralNumber: "10:07:03:02:01:0101",
  taxId: "301234567",
  farmName: "Navbahor Agro",
  bonitet: 72,
  areaHectares: 35.4,
  bonitetSource: "Tuman yer resurslari bo‘limi",
  bonitetValidAt: "2026-01-15",
};

export const testPlotLookupSource: PlotLookupSource = {
  async find(method, value) {
    const normalized = value.trim().toUpperCase();
    const candidate = method === "CADASTRAL_NUMBER"
      ? TEST_REGISTRY_RECORD.cadastralNumber.toUpperCase()
      : TEST_REGISTRY_RECORD.taxId.toUpperCase();
    return normalized === candidate ? TEST_REGISTRY_RECORD : null;
  },
};
