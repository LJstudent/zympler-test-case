import { loadEnergyData } from "~/features/energy-data";
import type { EnergyDataset } from "~/features/energy-data";

import { calculateSolarChargingKpi } from "./solar-charging";

export async function loadOverviewData(): Promise<EnergyDataset> {
  const dataset = await loadEnergyData();
  const solarChargingKpi = calculateSolarChargingKpi(dataset.totals);

  if (import.meta.env.DEV && !solarChargingKpi.isDataConsistent) {
    console.warn(
      "The charger energy total differs from the combined solar and grid charger totals.",
    );
  }

  return dataset;
}
