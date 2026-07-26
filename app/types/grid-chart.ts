export type GridPeriod = "year" | "month" | "day";

export type GridSeriesKey =
  | "gridImport"
  | "gridExport"
  | "gridToCharger"
  | "gridToBattery"
  | "solarToGrid"
  | "gridBatteryToGrid";

export type GridSeriesDirection = "import" | "export";

export interface GridSeriesDefinition {
  key: GridSeriesKey;
  label: string;
  detail: string;
  color: string;
  direction: GridSeriesDirection;
  kind: "total" | "breakdown";
}

export interface AggregatedGridDatum {
  timestamp: number;
  intervalEnd: number;
  gridImport: number;
  gridExport: number;
  gridToCharger: number;
  gridToBattery: number;
  solarToGrid: number;
  gridBatteryToGrid: number;
}

export type GridChartDatum = AggregatedGridDatum & Record<GridSeriesKey, number>;

export interface GridViolation {
  timestamp: number;
  importKw?: number;
  exportKw?: number;
}

export interface GridChartData {
  data: AggregatedGridDatum[];
  violations: GridViolation[];
  domain: [number, number];
  rangeLabel: string;
}
