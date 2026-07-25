import type { EnergyColumnIndexes } from "./excel-columns";
import { toNumberOrZero } from "./parse-energy-row";
import type { EnergyTotals } from "./types";

export function parseEnergyTotals(
  values: readonly unknown[],
  columns: EnergyColumnIndexes,
): EnergyTotals {
  return {
    solarGenerationKwh: toNumberOrZero(values[columns.fromSolar]),
    chargerEnergyKwh: toNumberOrZero(values[columns.toCharger]),
    totalSolarToChargerKwh: toNumberOrZero(values[columns.totalSolarToCharger]),
    totalGridToChargerKwh: toNumberOrZero(values[columns.totalGridToCharger]),
  };
}
