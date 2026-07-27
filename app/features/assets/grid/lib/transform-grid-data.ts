import type { EnergyDataRow } from "~/features/energy-data";

import { GRID_CAPACITY_LIMITS } from "../constants/grid-constants";
import type {
  GridAggregation,
  GridCapacityViolation,
  GridChartDatum,
  GridMetric,
  GridPeriodOption,
  GridTimeView,
} from "../types/grid-types";

const HOUR_MS = 60 * 60 * 1_000;

type GridBucket = Omit<
  GridChartDatum,
  "timestamp" | "label" | "importViolation" | "exportViolation"
>;

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function periodKey(date: Date, view: GridTimeView): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  if (view === "year") return String(year);
  if (view === "month") return `${year}-${month}`;
  return `${year}-${month}-${day}`;
}

function periodStart(date: Date, view: GridTimeView): Date {
  if (view === "year") return new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  if (view === "month") return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  return startOfUtcDay(date);
}

function nextPeriod(start: Date, view: GridTimeView): Date {
  if (view === "year") return new Date(Date.UTC(start.getUTCFullYear() + 1, 0, 1));
  if (view === "month") {
    return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
  }
  return new Date(start.getTime() + 24 * HOUR_MS);
}

function bucketStart(date: Date, view: GridTimeView, aggregation: GridAggregation): Date {
  if (view === "year" && aggregation === "combined") {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  }

  if (view === "year" || (view === "month" && aggregation === "combined")) {
    return startOfUtcDay(date);
  }

  if (view === "month" || (view === "day" && aggregation === "combined")) {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours()),
    );
  }

  return new Date(date.getTime());
}

function formatPeriod(date: Date, view: GridTimeView): string {
  if (view === "year") return String(date.getUTCFullYear());
  if (view === "month") {
    return new Intl.DateTimeFormat("en", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  }
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatBucket(date: Date, view: GridTimeView, aggregation: GridAggregation): string {
  if (view === "year" && aggregation === "combined") {
    return new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" }).format(date);
  }
  if (view === "year" || (view === "month" && aggregation === "combined")) {
    return new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(date);
  }
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

function emptyBucket(timestampMs: number, intervalEndMs: number): GridBucket {
  return {
    timestampMs,
    intervalEndMs,
    gridImport: 0,
    gridExport: 0,
    solarToGrid: 0,
    solarBatteryToGrid: 0,
    gridBatteryToGrid: 0,
    gridToBattery: 0,
    gridToCharger: 0,
    ownUse: 0,
  };
}

function addRow(bucket: GridBucket, row: EnergyDataRow): void {
  const gridImport = Math.max(row.measurement.gridImportKwh ?? 0, 0);
  const gridExport = Math.max(row.measurement.gridExportKwh ?? 0, 0);
  const gridToBattery = Math.max(row.flows.grid.toBatteryKwh, 0);
  const gridToCharger = Math.max(row.flows.grid.toChargerKwh, 0);

  bucket.gridImport += gridImport;
  bucket.gridExport -= gridExport;
  bucket.solarToGrid -= Math.max(row.flows.solar.toGridKwh, 0);
  bucket.solarBatteryToGrid -= Math.max(row.flows.battery.solarOrigin.toGridKwh, 0);
  bucket.gridBatteryToGrid -= Math.max(row.flows.battery.gridOrigin.toGridKwh, 0);
  bucket.gridToBattery += gridToBattery;
  bucket.gridToCharger += gridToCharger;
}

function toPower(value: number, durationHours: number): number {
  return durationHours > 0 ? value / durationHours : 0;
}

function reconcileBreakdown(bucket: GridBucket): GridBucket {
  const importTotal = Math.max(bucket.gridImport, 0);
  const importDestinations = [Math.max(bucket.gridToCharger, 0), Math.max(bucket.gridToBattery, 0)];
  const knownImportTotal = importDestinations[0] + importDestinations[1];
  const importIsOverAllocated = knownImportTotal > importTotal && knownImportTotal > 0;
  const gridToCharger = importIsOverAllocated
    ? (importDestinations[0] / knownImportTotal) * importTotal
    : importDestinations[0];
  const gridToBattery = importIsOverAllocated ? importTotal - gridToCharger : importDestinations[1];
  const ownUse = importIsOverAllocated
    ? 0
    : Math.max(importTotal - gridToCharger - gridToBattery, 0);

  const exportTotal = Math.max(-bucket.gridExport, 0);
  const exportSources = [
    Math.max(-bucket.solarToGrid, 0),
    Math.max(-bucket.solarBatteryToGrid, 0),
    Math.max(-bucket.gridBatteryToGrid, 0),
  ];
  const knownExportTotal = exportSources.reduce((sum, value) => sum + value, 0);
  const normalizedExportSources =
    exportTotal === 0
      ? [0, 0, 0]
      : knownExportTotal === 0
        ? [exportTotal, 0, 0]
        : exportSources.map((value) => (value / knownExportTotal) * exportTotal);

  return {
    ...bucket,
    gridToCharger,
    gridToBattery,
    ownUse,
    solarToGrid: -normalizedExportSources[0],
    solarBatteryToGrid: -normalizedExportSources[1],
    gridBatteryToGrid: -(exportTotal - normalizedExportSources[0] - normalizedExportSources[1]),
  };
}

export function getGridPeriodOptions(
  rows: readonly EnergyDataRow[],
  view: GridTimeView,
): GridPeriodOption[] {
  const unique = new Map<string, GridPeriodOption>();

  for (const row of rows) {
    const key = periodKey(row.start, view);
    if (!unique.has(key)) {
      const start = periodStart(row.start, view);
      unique.set(key, { key, label: formatPeriod(start, view), start });
    }
  }

  return [...unique.values()].sort((a, b) => b.start.getTime() - a.start.getTime());
}

export function getLatestGridPeriodKey(rows: readonly EnergyDataRow[], view: GridTimeView): string {
  return getGridPeriodOptions(rows, view)[0]?.key ?? "";
}

export function transformGridData(
  rows: readonly EnergyDataRow[],
  view: GridTimeView,
  aggregation: GridAggregation,
  metric: GridMetric,
  selectedPeriodKey: string,
): GridChartDatum[] {
  const selectedStart = getGridPeriodOptions(rows, view).find(
    (option) => option.key === selectedPeriodKey,
  )?.start;

  if (selectedStart === undefined) return [];

  const selectedEnd = nextPeriod(selectedStart, view);
  const buckets = new Map<number, GridBucket>();

  for (const row of rows) {
    if (row.start < selectedStart || row.start >= selectedEnd) continue;
    const start = bucketStart(row.start, view, aggregation);
    const timestampMs = start.getTime();
    const existing = buckets.get(timestampMs);
    const bucket = existing ?? emptyBucket(timestampMs, row.end.getTime());
    bucket.intervalEndMs = Math.max(bucket.intervalEndMs, row.end.getTime());
    addRow(bucket, row);
    buckets.set(timestampMs, bucket);
  }

  return [...buckets.values()]
    .sort((a, b) => a.timestampMs - b.timestampMs)
    .map((bucket) => {
      const reconciled = reconcileBreakdown(bucket);
      const durationHours = (bucket.intervalEndMs - bucket.timestampMs) / HOUR_MS;
      const values =
        metric === "power"
          ? {
              gridImport: toPower(reconciled.gridImport, durationHours),
              gridExport: toPower(reconciled.gridExport, durationHours),
              solarToGrid: toPower(reconciled.solarToGrid, durationHours),
              solarBatteryToGrid: toPower(reconciled.solarBatteryToGrid, durationHours),
              gridBatteryToGrid: toPower(reconciled.gridBatteryToGrid, durationHours),
              gridToBattery: toPower(reconciled.gridToBattery, durationHours),
              gridToCharger: toPower(reconciled.gridToCharger, durationHours),
              ownUse: toPower(reconciled.ownUse, durationHours),
            }
          : reconciled;

      return {
        ...reconciled,
        ...values,
        timestamp: new Date(bucket.timestampMs),
        label: formatBucket(new Date(bucket.timestampMs), view, aggregation),
        importViolation: metric === "power" && values.gridImport > GRID_CAPACITY_LIMITS.importKw,
        exportViolation: metric === "power" && values.gridExport < -GRID_CAPACITY_LIMITS.exportKw,
      };
    });
}

export function calculateGridCapacityViolations(
  rows: readonly EnergyDataRow[],
): GridCapacityViolation[] {
  const violations: GridCapacityViolation[] = [];

  for (const row of rows) {
    const durationHours = (row.end.getTime() - row.start.getTime()) / HOUR_MS;
    if (!Number.isFinite(durationHours) || durationHours <= 0) continue;
    const importKw = Math.max(row.measurement.gridImportKwh ?? 0, 0) / durationHours;
    const exportKw = Math.max(row.measurement.gridExportKwh ?? 0, 0) / durationHours;

    if (importKw > GRID_CAPACITY_LIMITS.importKw) {
      violations.push({
        id: `${row.start.getTime()}-import`,
        direction: "import",
        timestamp: row.start,
        measuredKw: importKw,
        limitKw: GRID_CAPACITY_LIMITS.importKw,
        exceededByKw: importKw - GRID_CAPACITY_LIMITS.importKw,
      });
    }

    if (exportKw > GRID_CAPACITY_LIMITS.exportKw) {
      violations.push({
        id: `${row.start.getTime()}-export`,
        direction: "export",
        timestamp: row.start,
        measuredKw: exportKw,
        limitKw: GRID_CAPACITY_LIMITS.exportKw,
        exceededByKw: exportKw - GRID_CAPACITY_LIMITS.exportKw,
      });
    }
  }

  return violations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function getGridDayKey(date: Date): string {
  return periodKey(date, "day");
}
