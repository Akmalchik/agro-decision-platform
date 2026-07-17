import { z } from "zod";
import { polygonSchema } from "@/gis/schemas/plot-feature-collection.schema";
import { previousCropValues, waterSupplyValues } from "@/modules/plots/domain/plot-classification";

export const plotIdSchema = z.uuid();

export const plotGeometrySchema = polygonSchema;

export const waterSupplySchema = z.enum(waterSupplyValues);
export const previousCropSchema = z.enum(previousCropValues);
export const plotLookupMethodSchema = z.enum(["CADASTRAL_NUMBER", "TAX_ID"]);

export const createPlotSchema = z.object({
  geometry: plotGeometrySchema,
  cadastralNumber: z.string().trim().min(3).max(100),
  taxId: z.string().trim().min(3).max(30),
  farmName: z.string().trim().min(2).max(160),
  bonitet: z.number().min(0).max(100),
  waterSupply: waterSupplySchema,
  previousCrop: previousCropSchema,
});
