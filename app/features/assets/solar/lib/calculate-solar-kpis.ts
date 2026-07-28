import type { EnergyDataRow } from "~/features/energy-data";

import type { SolarFlowId, SolarKpiSummary } from "../types/solar-types";
import { calculateSolarInterval } from "./calculate-solar-interval";

function percentage(value: number, total: number): number {
  return total > 0 ? (value / total) * 100 : 0;
}

export function calculateSolarKpis(rows: readonly EnergyDataRow[]): SolarKpiSummary {
  const totals: Record<SolarFlowId, { energyKwh: number; estimatedValue: number }> = {
    ownUse: { energyKwh: 0, estimatedValue: 0 },
    solarToCharger: { energyKwh: 0, estimatedValue: 0 },
    solarToBattery: { energyKwh: 0, estimatedValue: 0 },
    solarToGrid: { energyKwh: 0, estimatedValue: 0 },
  };
  let totalProductionKwh = 0;

  for (const row of rows) {
    const interval = calculateSolarInterval(row);
    const pricePerKwh =
      row.measurement.pricePerKwh !== null && Number.isFinite(row.measurement.pricePerKwh)
        ? row.measurement.pricePerKwh
        : 0;
    totalProductionKwh += interval.productionKwh;

    const flows: Record<SolarFlowId, number> = {
      ownUse: interval.ownUseKwh,
      solarToCharger: interval.toChargerKwh,
      solarToBattery: interval.toBatteryKwh,
      solarToGrid: interval.toGridKwh,
    };
    for (const [id, energyKwh] of Object.entries(flows) as [SolarFlowId, number][]) {
      totals[id].energyKwh += energyKwh;
      if (id !== "solarToGrid") {
        totals[id].estimatedValue += energyKwh * pricePerKwh;
      }
    }
  }

  const localUseKwh =
    totals.ownUse.energyKwh + totals.solarToCharger.energyKwh + totals.solarToBattery.energyKwh;
  const exportedKwh = totals.solarToGrid.energyKwh;
  return {
    measurementCount: rows.length,
    totalProductionKwh,
    localUseKwh,
    localUsePercentage: percentage(localUseKwh, totalProductionKwh),
    exportedKwh,
    exportedPercentage: percentage(exportedKwh, totalProductionKwh),
    breakdown: [
      { id: "ownUse", ...totals.ownUse },
      { id: "solarToCharger", ...totals.solarToCharger },
      { id: "solarToBattery", ...totals.solarToBattery },
      { id: "solarToGrid", energyKwh: totals.solarToGrid.energyKwh },
    ],
  };
}
