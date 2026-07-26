import type { EnergyDataRow } from "~/features/energy-data";
import type { AggregatedGridDatum, GridPeriod } from "~/types/grid-chart";

const DAY_MS = 24 * 60 * 60 * 1_000;
const FIFTEEN_MINUTES_MS = 15 * 60 * 1_000;

function startOfUtcDay(timestamp: number): number {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function getGridPeriodRange(
  rows: readonly EnergyDataRow[],
  period: GridPeriod,
): [number, number] {
  const latestTimestamp = rows.reduce(
    (latest, row) => Math.max(latest, row.start.getTime()),
    Number.NEGATIVE_INFINITY,
  );

  if (!Number.isFinite(latestTimestamp)) {
    return [0, 0];
  }

  const latest = new Date(latestTimestamp);

  if (period === "year") {
    return [Date.UTC(latest.getUTCFullYear(), 0, 1), Date.UTC(latest.getUTCFullYear() + 1, 0, 1)];
  }

  if (period === "month") {
    return [
      Date.UTC(latest.getUTCFullYear(), latest.getUTCMonth(), 1),
      Date.UTC(latest.getUTCFullYear(), latest.getUTCMonth() + 1, 1),
    ];
  }

  const dayStart = startOfUtcDay(latestTimestamp);
  return [dayStart, dayStart + DAY_MS];
}

function getBucketStart(timestamp: number, period: GridPeriod): number {
  if (period !== "day") {
    return startOfUtcDay(timestamp);
  }

  return Math.floor(timestamp / FIFTEEN_MINUTES_MS) * FIFTEEN_MINUTES_MS;
}

function createBucket(timestamp: number, intervalEnd: number): AggregatedGridDatum {
  return {
    timestamp,
    intervalEnd,
    gridImport: 0,
    gridExport: 0,
    gridToCharger: 0,
    gridToBattery: 0,
    solarToGrid: 0,
    gridBatteryToGrid: 0,
  };
}

export function aggregateGridData(
  rows: readonly EnergyDataRow[],
  period: GridPeriod,
): AggregatedGridDatum[] {
  const [rangeStart, rangeEnd] = getGridPeriodRange(rows, period);
  const bucketDuration = period === "day" ? FIFTEEN_MINUTES_MS : DAY_MS;
  const buckets = new Map<number, AggregatedGridDatum>();

  for (const row of rows) {
    const timestamp = row.start.getTime();

    if (timestamp < rangeStart || timestamp >= rangeEnd) {
      continue;
    }

    const bucketStart = getBucketStart(timestamp, period);
    const bucket =
      buckets.get(bucketStart) ?? createBucket(bucketStart, bucketStart + bucketDuration);

    bucket.gridImport += Math.max(row.measurement.gridImportKwh ?? 0, 0);
    bucket.gridExport += Math.max(row.measurement.gridExportKwh ?? 0, 0);
    bucket.gridToCharger += Math.max(row.flows.grid.toChargerKwh, 0);
    bucket.gridToBattery += Math.max(row.flows.grid.toBatteryKwh, 0);
    bucket.solarToGrid += Math.max(row.flows.solar.toGridKwh, 0);
    bucket.gridBatteryToGrid += Math.max(row.flows.battery.gridOrigin.toGridKwh, 0);
    buckets.set(bucketStart, bucket);
  }

  return [...buckets.values()].sort((left, right) => left.timestamp - right.timestamp);
}
