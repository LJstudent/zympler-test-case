import { formatEnergy } from "~/features/energy-data";
import type { EnergyDataRow } from "~/features/energy-data";

const ASSET_ENERGY_FORMAT_OPTIONS = {
  kwhMaximumFractionDigits: 1,
  mwhMaximumFractionDigits: 2,
} as const;

type ValidRowPredicate = (row: EnergyDataRow) => boolean;

function isValidDate(value: Date): boolean {
  return Number.isFinite(value.getTime());
}

function getUtcDayKey(value: Date): string {
  return [
    value.getUTCFullYear(),
    String(value.getUTCMonth() + 1).padStart(2, "0"),
    String(value.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function readNonNegativeEnergy(value: number | null): number | null {
  return value !== null && Number.isFinite(value) && value >= 0 ? value : null;
}

export function getLatestAssetDate(
  rows: readonly EnergyDataRow[],
  isValidRow: ValidRowPredicate,
): Date | null {
  let latest: Date | null = null;

  for (const row of rows) {
    if (
      isValidDate(row.start) &&
      isValidRow(row) &&
      (latest === null || getUtcDayKey(row.start) > getUtcDayKey(latest))
    ) {
      latest = row.start;
    }
  }

  return latest === null
    ? null
    : new Date(Date.UTC(latest.getUTCFullYear(), latest.getUTCMonth(), latest.getUTCDate()));
}

export function filterAssetRowsByDate(
  rows: readonly EnergyDataRow[],
  date: Date,
  isValidRow: ValidRowPredicate,
): EnergyDataRow[] {
  const dayKey = getUtcDayKey(date);

  return rows.filter(
    (row) => isValidDate(row.start) && isValidRow(row) && getUtcDayKey(row.start) === dayKey,
  );
}

export function sortAssetRowsChronologically(rows: readonly EnergyDataRow[]): EnergyDataRow[] {
  return [...rows].sort((left, right) => left.start.getTime() - right.start.getTime());
}

export function formatAssetEnergy(kilowattHours: number): string {
  return formatEnergy(kilowattHours, "en", ASSET_ENERGY_FORMAT_OPTIONS);
}

export function formatAssetPercentage(percentage: number): string {
  const safePercentage = Number.isFinite(percentage) ? Math.min(Math.max(percentage, 0), 100) : 0;

  return `${new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(safePercentage)}%`;
}
