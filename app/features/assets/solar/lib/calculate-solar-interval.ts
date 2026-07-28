import type { EnergyDataRow } from "~/features/energy-data";

import type { SolarInterval } from "../types/solar-types";

function nonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}

export function calculateSolarInterval(row: EnergyDataRow): SolarInterval {
  const productionKwh = nonNegative(row.measurement.solarGenerationKwh);
  const destinations = [
    nonNegative(row.flows.solar.toChargerKwh),
    nonNegative(row.flows.solar.toBatteryKwh),
    nonNegative(row.flows.solar.toGridKwh),
  ] as const;
  const destinationTotal = destinations.reduce((sum, value) => sum + value, 0);
  const scale =
    destinationTotal > productionKwh && destinationTotal > 0 ? productionKwh / destinationTotal : 1;
  const toChargerKwh = destinations[0] * scale;
  const toBatteryKwh = destinations[1] * scale;
  const toGridKwh = destinations[2] * scale;
  const ownUseKwh = Math.max(productionKwh - toChargerKwh - toBatteryKwh - toGridKwh, 0);

  return {
    productionKwh,
    ownUseKwh,
    toChargerKwh,
    toBatteryKwh,
    toGridKwh,
  };
}
