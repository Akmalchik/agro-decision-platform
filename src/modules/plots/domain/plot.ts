import type { SoilProfile } from "@/modules/soil/domain/soil-profile";

export type Plot = {
  id: string;
  cadastralNumber: string;
  farmName: string;
  owner: string;
  area: string;
  specialization: string | null;
  taxId: string | null;
  waterSupply: string | null;
  previousCrop: string | null;
  createdAt: Date;
  soilProfile: SoilProfile | null;
};
