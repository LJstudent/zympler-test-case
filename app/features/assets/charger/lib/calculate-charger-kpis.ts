import type { EnergyDataRow } from "~/features/energy-data";

import type { ChargerKpiSummary } from "../types/charger-kpi-types";
import { calculateChargerInterval } from "./calculate-charger-interval";

function nonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}

function percentage(value: number, total: number): number | null {
  return total > 0 ? (value / total) * 100 : null;
}

export function calculateChargerKpis(rows: readonly EnergyDataRow[]): ChargerKpiSummary {
  let totalChargedKwh = 0;
  let totalSolarToChargerKwh = 0;
  let solarToChargerKwh = 0;
  let batterySolarToChargerKwh = 0;
  let batteryGridToChargerKwh = 0;
  let gridToChargerKwh = 0;

  for (const row of rows) {
    const interval = calculateChargerInterval(row);
    totalChargedKwh += interval.totalChargedKwh;
    totalSolarToChargerKwh += nonNegative(row.flows.charger.totalFromSolarKwh);
    solarToChargerKwh += interval.solarToChargerKwh;
    batterySolarToChargerKwh += interval.batterySolarToChargerKwh;
    batteryGridToChargerKwh += interval.batteryGridToChargerKwh;
    gridToChargerKwh += interval.gridToChargerKwh;
  }

  return {
    measurementCount: rows.length,
    totalChargedKwh,
    totalSolarToChargerKwh,
    solarChargingPercentage: percentage(totalSolarToChargerKwh, totalChargedKwh),
    breakdown: [
      {
        id: "solarToCharger",
        energyKwh: solarToChargerKwh,
        percentage: percentage(solarToChargerKwh, totalChargedKwh),
      },
      {
        id: "batterySolarToCharger",
        energyKwh: batterySolarToChargerKwh,
        percentage: percentage(batterySolarToChargerKwh, totalChargedKwh),
      },
      {
        id: "batteryGridToCharger",
        energyKwh: batteryGridToChargerKwh,
        percentage: percentage(batteryGridToChargerKwh, totalChargedKwh),
      },
      {
        id: "gridToCharger",
        energyKwh: gridToChargerKwh,
        percentage: percentage(gridToChargerKwh, totalChargedKwh),
      },
    ],
  };
}
