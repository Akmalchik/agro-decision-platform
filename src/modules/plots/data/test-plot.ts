import type { Plot } from "@/modules/plots/domain/plot";

export const TEST_PLOT_ID = "3b572172-3df0-4d73-92ec-5f851de43b0b";

export const TEST_PLOT: Plot = {
  id: TEST_PLOT_ID,
  cadastralNumber: "10:07:03:02:01:0042",
  farmName: "Baraka Hosil Agro",
  owner: "Тестовый землепользователь",
  area: "42.7",
  specialization: "Хлопково-зерновое хозяйство",
  createdAt: new Date("2026-07-13T00:00:00.000Z"),
  soilProfile: {
    id: "a9cabd54-cf93-4845-a96e-c13f0636e993",
    plotId: TEST_PLOT_ID,
    bonitet: "67",
  },
};
