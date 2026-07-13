import { z } from "zod";

const positionSchema = z.tuple([z.number(), z.number()]);

const linearRingSchema = z.array(positionSchema).min(4).refine(
  (ring) => {
    const first = ring[0];
    const last = ring.at(-1);
    return first !== undefined && last !== undefined && first[0] === last[0] && first[1] === last[1];
  },
  "GeoJSON linear ring must be closed",
);

const polygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(linearRingSchema).min(1),
});

export const plotMapPropertiesSchema = z.object({
  plotId: z.uuid(),
  cadastralNumber: z.string().min(1),
  farmName: z.string().min(1),
  area: z.string().min(1),
  bonitet: z.string().nullable(),
  specialization: z.string().nullable(),
});

export const plotFeatureCollectionSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(z.object({
    type: z.literal("Feature"),
    id: z.string().uuid(),
    geometry: polygonSchema,
    properties: plotMapPropertiesSchema,
  })),
});
