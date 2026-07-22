import type { EnergyColumnIndexes } from "./excel-columns";
import { toNumberOrZero } from "./parse-energy-row";
import type { EnergyTotals } from "./types";

export function parseEnergyTotals(
  values: readonly unknown[],
  columns: EnergyColumnIndexes,
): EnergyTotals {
  return {
    solarGenerationKwh: toNumberOrZero(values[columns.solarGeneration]),
    chargerEnergyKwh: toNumberOrZero(values[columns.chargerEnergy]),
    totalSolarToChargerKwh: toNumberOrZero(values[columns.totalSolarToCharger]),
    totalGridToChargerKwh: toNumberOrZero(values[columns.totalGridToCharger]),
  };
}
