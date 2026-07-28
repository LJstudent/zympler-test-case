import type { ChargerBreakdownSeriesKey } from "./charger-types";

export type ChargerBreakdownKpi = {
  id: ChargerBreakdownSeriesKey;
  energyKwh: number;
  percentage: number | null;
};

export type ChargerKpiSummary = {
  measurementCount: number;
  totalChargedKwh: number;
  totalSolarToChargerKwh: number;
  solarChargingPercentage: number | null;
  breakdown: readonly ChargerBreakdownKpi[];
};
