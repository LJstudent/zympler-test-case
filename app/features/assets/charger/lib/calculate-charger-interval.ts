import type { EnergyDataRow } from "~/features/energy-data";

import type { ChargerInterval } from "../types/charger-types";

function nonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}

export function calculateChargerInterval(row: EnergyDataRow): ChargerInterval {
  return {
    totalChargedKwh: nonNegative(row.measurement.chargerEnergyKwh),
    solarToChargerKwh: nonNegative(row.flows.solar.toChargerKwh),
    batterySolarToChargerKwh: nonNegative(row.flows.battery.solarOrigin.toChargerKwh),
    batteryGridToChargerKwh: nonNegative(row.flows.battery.gridOrigin.toChargerKwh),
    gridToChargerKwh: nonNegative(row.flows.grid.toChargerKwh),
  };
}
