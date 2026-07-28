import type {
  AssetAggregation,
  AssetChartDatum,
  AssetChartSeries,
  AssetMetric,
  AssetPeriodOption,
  AssetTimeView,
} from "../../shared";

export type GridTimeView = AssetTimeView;
export type GridAggregation = AssetAggregation;
export type GridMetric = AssetMetric;
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

export type GridPeriodOption = AssetPeriodOption;

export type GridChartDatum = AssetChartDatum & {
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

export type GridChartSeries = AssetChartSeries<GridSeriesKey>;

export type GridViewSelection = {
  timeView: GridTimeView;
  aggregation: GridAggregation;
  metric: GridMetric;
  breakdown: boolean;
  showViolations: boolean;
  periodKey: string;
};
