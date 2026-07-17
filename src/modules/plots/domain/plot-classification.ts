export const waterSupplyValues = ["HIGH", "MEDIUM", "LOW"] as const;
export type WaterSupply = (typeof waterSupplyValues)[number];

export const previousCropValues = ["WHEAT", "COTTON", "CORN", "RICE", "VEGETABLES", "LEGUMES", "FALLOW", "OTHER"] as const;
export type PreviousCrop = (typeof previousCropValues)[number];
