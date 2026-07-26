import type { AggregatedGridDatum, GridChartDatum } from "~/types/grid-chart";

export function buildStackedSeries(data: readonly AggregatedGridDatum[]): GridChartDatum[] {
  return data.map((datum) => ({
    ...datum,
    gridImport: datum.gridImport,
    gridExport: -datum.gridExport,
    gridToCharger: datum.gridToCharger,
    gridToBattery: datum.gridToBattery,
    solarToGrid: -datum.solarToGrid,
    gridBatteryToGrid: -datum.gridBatteryToGrid,
  }));
}
