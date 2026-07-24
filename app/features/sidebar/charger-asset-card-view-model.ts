import type { EnergyDataRow } from "~/features/energy-data";

import {
  filterAssetRowsByDate,
  formatAssetEnergy,
  formatAssetPercentage,
  getLatestAssetDate,
  readNonNegativeEnergy,
  sortAssetRowsChronologically,
} from "./asset-card-data";

export interface ChargerActivityPoint {
  timestamp: number;
  chargedKwh: number;
}

export interface ChargerAssetCardViewModel {
  activity: ChargerActivityPoint[];
  chargedDisplay: string;
  solarDisplay: string;
  hasConsistentSourceData: boolean;
}

export function readChargerEnergy(row: EnergyDataRow): number | null {
  return readNonNegativeEnergy(row.measurement.chargerEnergyKwh);
}

export function readDirectSolarToChargerEnergy(row: EnergyDataRow): number | null {
  return readNonNegativeEnergy(row.flows.solar.toChargerKwh);
}

function hasValidChargerMeasurement(row: EnergyDataRow): boolean {
  return readChargerEnergy(row) !== null;
}

export function buildChargerActivity(rows: readonly EnergyDataRow[]): ChargerActivityPoint[] {
  return rows.flatMap((row) => {
    const chargedKwh = readChargerEnergy(row);

    return chargedKwh === null ? [] : [{ timestamp: row.start.getTime(), chargedKwh }];
  });
}

export function calculateDailyChargedEnergy(rows: readonly EnergyDataRow[]): number {
  return rows.reduce((total, row) => total + (readChargerEnergy(row) ?? 0), 0);
}

export function calculateDailyDirectSolarEnergy(rows: readonly EnergyDataRow[]): number {
  return rows.reduce((total, row) => total + (readDirectSolarToChargerEnergy(row) ?? 0), 0);
}

export function calculateDirectSolarPercentage(
  totalChargedEnergy: number,
  directSolarEnergy: number,
): number | null {
  if (
    !Number.isFinite(totalChargedEnergy) ||
    !Number.isFinite(directSolarEnergy) ||
    totalChargedEnergy <= 0
  ) {
    return null;
  }

  return Math.min(Math.max((directSolarEnergy / totalChargedEnergy) * 100, 0), 100);
}

export function createChargerAssetCardViewModel(
  rows: readonly EnergyDataRow[],
): ChargerAssetCardViewModel | null {
  const latestDate = getLatestAssetDate(rows, hasValidChargerMeasurement);

  if (latestDate === null) {
    return null;
  }

  const latestRows = sortAssetRowsChronologically(
    filterAssetRowsByDate(rows, latestDate, hasValidChargerMeasurement),
  );
  const totalChargedEnergy = calculateDailyChargedEnergy(latestRows);
  const directSolarEnergy = calculateDailyDirectSolarEnergy(latestRows);
  const solarPercentage = calculateDirectSolarPercentage(totalChargedEnergy, directSolarEnergy);
  const hasConsistentSourceData = directSolarEnergy <= totalChargedEnergy;

  if (import.meta.env.DEV && !hasConsistentSourceData) {
    console.warn(
      "Direct solar-to-charger energy exceeds total charged energy for the latest day.",
    );
  }

  return {
    activity: buildChargerActivity(latestRows),
    chargedDisplay: formatAssetEnergy(totalChargedEnergy),
    solarDisplay: solarPercentage === null ? "—" : formatAssetPercentage(solarPercentage),
    hasConsistentSourceData,
  };
}
