export type PlotLookupMethod = "CADASTRAL_NUMBER" | "TAX_ID";

export type PlotLookupRecord = {
  cadastralNumber: string;
  taxId: string;
  farmName: string;
  bonitet: number | null;
  areaHectares: number | null;
  bonitetSource: string | null;
  bonitetValidAt: string | null;
};

export interface PlotLookupSource {
  find(method: PlotLookupMethod, value: string): Promise<PlotLookupRecord | null>;
}
