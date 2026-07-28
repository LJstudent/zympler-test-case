import type { EnergyDataRow } from "~/features/energy-data";

import type {
  AssetAggregation,
  AssetPeriodOption,
  AssetTimeView,
} from "../types/asset-detail-types";

export const HOUR_MS = 60 * 60 * 1_000;

export function getCalendarDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseAssetDayKey(key: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (match === null) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return undefined;
  }

  return date;
}

export function getAssetPeriodKey(date: Date, view: AssetTimeView): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  if (view === "year") return String(year);
  if (view === "month") return `${year}-${month}`;
  return `${year}-${month}-${day}`;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function getAssetPeriodStart(date: Date, view: AssetTimeView): Date {
  if (view === "year") return new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  if (view === "month") {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  }
  return startOfUtcDay(date);
}

export function getNextAssetPeriod(start: Date, view: AssetTimeView): Date {
  if (view === "year") return new Date(Date.UTC(start.getUTCFullYear() + 1, 0, 1));
  if (view === "month") {
    return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
  }
  return new Date(start.getTime() + 24 * HOUR_MS);
}

export function getAssetBucketStart(
  date: Date,
  view: AssetTimeView,
  aggregation: AssetAggregation,
): Date {
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

export function formatAssetPeriod(date: Date, view: AssetTimeView): string {
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

export function formatAssetBucket(
  date: Date,
  view: AssetTimeView,
  aggregation: AssetAggregation,
): string {
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

export function getAssetPeriodOptions(
  rows: readonly EnergyDataRow[],
  view: AssetTimeView,
): AssetPeriodOption[] {
  const unique = new Map<string, AssetPeriodOption>();

  for (const row of rows) {
    const key = getAssetPeriodKey(row.start, view);
    if (!unique.has(key)) {
      const start = getAssetPeriodStart(row.start, view);
      unique.set(key, { key, label: formatAssetPeriod(start, view), start });
    }
  }

  return [...unique.values()].sort((left, right) => right.start.getTime() - left.start.getTime());
}

export function resolveAssetPeriodKey(
  options: readonly AssetPeriodOption[],
  preferredKey: string | undefined,
): string {
  if (preferredKey !== undefined && options.some((option) => option.key === preferredKey)) {
    return preferredKey;
  }
  return options[0]?.key ?? "";
}

export function selectAssetPeriodRows(
  rows: readonly EnergyDataRow[],
  view: AssetTimeView,
  selectedPeriodKey: string,
): EnergyDataRow[] {
  return rows.filter((row) => getAssetPeriodKey(row.start, view) === selectedPeriodKey);
}

export type AssetTimeBucket = {
  timestampMs: number;
  intervalEndMs: number;
  rows: EnergyDataRow[];
};

export function groupAssetRows(
  rows: readonly EnergyDataRow[],
  view: AssetTimeView,
  aggregation: AssetAggregation,
  selectedPeriodKey: string,
): AssetTimeBucket[] {
  const selectedStart = getAssetPeriodOptions(rows, view).find(
    (option) => option.key === selectedPeriodKey,
  )?.start;
  if (selectedStart === undefined) return [];

  const selectedEnd = getNextAssetPeriod(selectedStart, view);
  const buckets = new Map<number, AssetTimeBucket>();

  for (const row of rows) {
    if (row.start < selectedStart || row.start >= selectedEnd) continue;
    const timestampMs = getAssetBucketStart(row.start, view, aggregation).getTime();
    const bucket = buckets.get(timestampMs) ?? {
      timestampMs,
      intervalEndMs: row.end.getTime(),
      rows: [],
    };
    bucket.intervalEndMs = Math.max(bucket.intervalEndMs, row.end.getTime());
    bucket.rows.push(row);
    buckets.set(timestampMs, bucket);
  }

  return [...buckets.values()].sort((left, right) => left.timestampMs - right.timestampMs);
}
