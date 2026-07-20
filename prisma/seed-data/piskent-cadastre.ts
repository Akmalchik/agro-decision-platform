export type PilotPlot = {
  cadastralNumber: string;
  officialAreaHectares: string;
};

export type PilotFarm = {
  name: string;
  taxId: string;
  plots: PilotPlot[];
};

// Official cadastral source. Add future farms and plots to this collection.
export const PILOT_FARMS: PilotFarm[] = [
  {
    name: "BIG BULLS FEEDING",
    taxId: "307310179",
    plots: [
      { cadastralNumber: "11:10:000000612", officialAreaHectares: "30.72" },
      { cadastralNumber: "11:10:000000613", officialAreaHectares: "26.19" },
    ],
  },
  {
    name: "NEW ECO PRODUCT",
    taxId: "303194270",
    plots: [
      { cadastralNumber: "11:10:000172582", officialAreaHectares: "193.33" },
      { cadastralNumber: "11:10:000000079", officialAreaHectares: "11.04" },
    ],
  },
  {
    name: "G'ALABA CLUSTER",
    taxId: "305416617",
    plots: [
      { cadastralNumber: "11:10:000005739", officialAreaHectares: "40.40" },
      { cadastralNumber: "11:10:000234163", officialAreaHectares: "90.04" },
    ],
  },
];

export const PILOT_TAX_IDS = PILOT_FARMS.map((farm) => farm.taxId);
export const PILOT_CADASTRAL_NUMBERS = PILOT_FARMS.flatMap((farm) => farm.plots.map((plot) => plot.cadastralNumber));
