import type { EnergyDataRow } from "~/features/energy-data";
import type { GridViolation } from "~/types/grid-chart";

const HOUR_MS = 60 * 60 * 1_000;

export const GRID_LIMITS = {
  importKw: 750,
  exportKw: 500,
} as const;

export function detectGridViolations(
  rows: readonly EnergyDataRow[],
  range: readonly [number, number],
): GridViolation[] {
  const violations: GridViolation[] = [];

  for (const row of rows) {
    const timestamp = row.start.getTime();

    if (timestamp < range[0] || timestamp >= range[1]) {
      continue;
    }

    const durationHours = (row.end.getTime() - timestamp) / HOUR_MS;

    if (!Number.isFinite(durationHours) || durationHours <= 0) {
      continue;
    }

    const importKw = (row.measurement.gridImportKwh ?? 0) / durationHours;
    const exportKw = (row.measurement.gridExportKwh ?? 0) / durationHours;
    const importExceeded = importKw > GRID_LIMITS.importKw;
    const exportExceeded = exportKw > GRID_LIMITS.exportKw;

    if (importExceeded || exportExceeded) {
      violations.push({
        timestamp,
        ...(importExceeded ? { importKw } : {}),
        ...(exportExceeded ? { exportKw } : {}),
      });
    }
  }

  return violations;
}
