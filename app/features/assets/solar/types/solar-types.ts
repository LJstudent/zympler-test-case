import type { AssetChartDatum, AssetChartSeries } from "../../shared";

export type SolarSeriesKey =
  "totalSolar" | "ownUse" | "solarToCharger" | "solarToBattery" | "solarToGrid";

export type SolarChartDatum = AssetChartDatum & {
  totalSolar: number;
  ownUse: number;
  solarToCharger: number;
  solarToBattery: number;
  solarToGrid: number;
};

export type SolarChartSeries = AssetChartSeries<SolarSeriesKey>;

export type SolarFlowId = "ownUse" | "solarToCharger" | "solarToBattery" | "solarToGrid";

export type SolarFlowSummary = {
  id: SolarFlowId;
  energyKwh: number;
  estimatedValue: number;
};

export type SolarKpiSummary = {
  measurementCount: number;
  totalProductionKwh: number;
  localUseKwh: number;
  localUsePercentage: number;
  exportedKwh: number;
  exportedPercentage: number;
  breakdown: readonly SolarFlowSummary[];
};

export type SolarInterval = {
  productionKwh: number;
  ownUseKwh: number;
  toChargerKwh: number;
  toBatteryKwh: number;
  toGridKwh: number;
};
