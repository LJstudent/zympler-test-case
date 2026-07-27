export type GridTimeView = "year" | "month" | "day";
export type GridAggregation = "raw" | "combined";
export type GridMetric = "energy" | "power";
export type GridDirection = "import" | "export";

export type GridSeriesKey =
  | "gridImport"
  | "gridExport"
  | "solarToGrid"
  | "solarBatteryToGrid"
  | "gridBatteryToGrid"
  | "gridToBattery"
  | "gridToCharger"
  | "ownUse";

export type GridPeriodOption = {
  key: string;
  label: string;
  start: Date;
};

export type GridChartDatum = {
  timestamp: string;
  timestampMs: number;
  intervalEndMs: number;
  label: string;
  gridImport: number;
  gridExport: number;
  solarToGrid: number;
  solarBatteryToGrid: number;
  gridBatteryToGrid: number;
  gridToBattery: number;
  gridToCharger: number;
  ownUse: number;
  importViolation: boolean;
  exportViolation: boolean;
};

export type GridCapacityViolation = {
  id: string;
  direction: GridDirection;
  timestamp: Date;
  measuredKw: number;
  limitKw: number;
  exceededByKw: number;
};

export type GridChartSeries = {
  key: GridSeriesKey;
  label: string;
  color: string;
  stackId?: string;
};

export type GridViewSelection = {
  timeView: GridTimeView;
  aggregation: GridAggregation;
  metric: GridMetric;
  breakdown: boolean;
  showViolations: boolean;
  periodKey: string;
};
