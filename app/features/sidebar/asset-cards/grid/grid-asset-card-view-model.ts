import type { EnergyDataRow } from "~/features/energy-data";

import {
  filterAssetRowsByDate,
  formatAssetEnergy,
  getLatestAssetDate,
  readNonNegativeEnergy,
  sortAssetRowsChronologically,
} from "../../data/asset-card-data";

export interface GridActivityPoint {
  timestamp: number;
  netGridKwh: number;
}

export interface GridAssetCardViewModel {
  activity: GridActivityPoint[];
  importDisplay: string;
  exportDisplay: string;
}

export function readGridImport(row: EnergyDataRow): number | null {
  return readNonNegativeEnergy(row.measurement.gridImportKwh);
}

export function readGridExport(row: EnergyDataRow): number | null {
  return readNonNegativeEnergy(row.measurement.gridExportKwh);
}

function hasValidGridMeasurement(row: EnergyDataRow): boolean {
  return readGridImport(row) !== null && readGridExport(row) !== null;
}

export function getLatestGridDate(rows: readonly EnergyDataRow[]): Date | null {
  return getLatestAssetDate(rows, hasValidGridMeasurement);
}

export function filterGridRowsByDate(rows: readonly EnergyDataRow[], date: Date): EnergyDataRow[] {
  return filterAssetRowsByDate(rows, date, hasValidGridMeasurement);
}

export function sortGridRowsChronologically(rows: readonly EnergyDataRow[]): EnergyDataRow[] {
  return sortAssetRowsChronologically(rows);
}

export function buildSignedGridActivity(rows: readonly EnergyDataRow[]): GridActivityPoint[] {
  return rows.flatMap((row) => {
    const gridImport = readGridImport(row);
    const gridExport = readGridExport(row);

    return gridImport === null || gridExport === null
      ? []
      : [{ timestamp: row.start.getTime(), netGridKwh: gridImport - gridExport }];
  });
}

export function calculateDailyGridImport(rows: readonly EnergyDataRow[]): number {
  return rows.reduce((total, row) => total + (readGridImport(row) ?? 0), 0);
}

export function calculateDailyGridExport(rows: readonly EnergyDataRow[]): number {
  return rows.reduce((total, row) => total + (readGridExport(row) ?? 0), 0);
}

export function createGridAssetCardViewModel(
  rows: readonly EnergyDataRow[],
): GridAssetCardViewModel | null {
  const latestDate = getLatestGridDate(rows);

  if (latestDate === null) {
    return null;
  }

  const latestRows = sortGridRowsChronologically(filterGridRowsByDate(rows, latestDate));

  return {
    activity: buildSignedGridActivity(latestRows),
    importDisplay: formatAssetEnergy(calculateDailyGridImport(latestRows)),
    exportDisplay: formatAssetEnergy(calculateDailyGridExport(latestRows)),
  };
}
