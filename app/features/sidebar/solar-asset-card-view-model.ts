import type { EnergyDataRow } from "~/features/energy-data";

import {
  filterAssetRowsByDate,
  formatAssetEnergy,
  getLatestAssetDate,
  readNonNegativeEnergy,
  sortAssetRowsChronologically,
} from "./asset-card-data";

export interface SolarActivityPoint {
  timestamp: number;
  generatedKwh: number;
}

export interface SolarAssetCardViewModel {
  activity: SolarActivityPoint[];
  generatedDisplay: string;
}

// The parsed domain model stores total solar generation as interval energy in kWh.
export function readSolarGeneration(row: EnergyDataRow): number | null {
  return readNonNegativeEnergy(row.measurement.solarGenerationKwh);
}

function hasValidSolarMeasurement(row: EnergyDataRow): boolean {
  return readSolarGeneration(row) !== null;
}

export function buildSolarActivity(rows: readonly EnergyDataRow[]): SolarActivityPoint[] {
  return rows.flatMap((row) => {
    const generatedKwh = readSolarGeneration(row);

    return generatedKwh === null ? [] : [{ timestamp: row.start.getTime(), generatedKwh }];
  });
}

export function calculateDailySolarGeneration(rows: readonly EnergyDataRow[]): number {
  return rows.reduce((total, row) => total + (readSolarGeneration(row) ?? 0), 0);
}

export function createSolarAssetCardViewModel(
  rows: readonly EnergyDataRow[],
): SolarAssetCardViewModel | null {
  const latestDate = getLatestAssetDate(rows, hasValidSolarMeasurement);

  if (latestDate === null) {
    return null;
  }

  const latestRows = sortAssetRowsChronologically(
    filterAssetRowsByDate(rows, latestDate, hasValidSolarMeasurement),
  );

  return {
    activity: buildSolarActivity(latestRows),
    generatedDisplay: formatAssetEnergy(calculateDailySolarGeneration(latestRows)),
  };
}
