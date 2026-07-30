import type { AssetAggregation, AssetMetric, AssetTimeView } from "../types/asset-detail-types";

export function formatAssetValue(value: number, metric: AssetMetric): string {
  const unit = metric === "power" ? "kW" : "kWh";
  const absolute = Math.abs(value);
  const maximumFractionDigits = absolute >= 100 ? 0 : absolute >= 10 ? 1 : 2;
  return `${value.toLocaleString("en", { maximumFractionDigits })} ${unit}`;
}

export function formatAssetMoney(value: number): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

type AssetDateFormat = {
  day?: "numeric";
  month?: "long";
  year?: "numeric";
  hour?: "2-digit";
  minute?: "2-digit";
};

const TOOLTIP_DATE_FORMATS: Record<AssetTimeView, Record<AssetAggregation, AssetDateFormat>> = {
  year: {
    combined: { month: "long", year: "numeric" },
    raw: { day: "numeric", month: "long", year: "numeric" },
  },
  month: {
    combined: { day: "numeric", month: "long", year: "numeric" },
    raw: {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  },
  day: {
    combined: { hour: "2-digit", minute: "2-digit" },
    raw: { hour: "2-digit", minute: "2-digit" },
  },
};

export function formatAssetTooltipTimestamp(
  date: Date,
  view: AssetTimeView,
  aggregation: AssetAggregation,
  intervalEnd?: Date,
): string {
  if (view === "day" && intervalEnd !== undefined && Number.isFinite(intervalEnd.getTime())) {
    const time = (value: Date) =>
      new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }).format(value);

    return `${time(date)}–${time(intervalEnd)}`;
  }

  if (view === "month" && aggregation === "raw") {
    const formattedDate = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
    const formattedTime = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(date);
    return `${formattedDate}, ${formattedTime}`;
  }

  return new Intl.DateTimeFormat("en-GB", {
    ...TOOLTIP_DATE_FORMATS[view][aggregation],
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

export function formatAssetAxisTimestamp(
  date: Date,
  view: AssetTimeView,
  aggregation: AssetAggregation,
): string {
  if (view === "year" && aggregation === "combined") {
    return new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(date);
  }
  if (view === "year" || view === "month") {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(date);
  }
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

export function getMonthRawAxisTicks(data: readonly { timestampMs: number }[]): number[] {
  return data
    .map((datum) => new Date(datum.timestampMs))
    .filter(
      (date) =>
        date.getUTCHours() === 0 &&
        date.getUTCMinutes() === 0 &&
        (date.getUTCDate() === 1 || date.getUTCDate() % 5 === 0),
    )
    .map((date) => date.getTime());
}

export function formatAssetResolution(
  count: number,
  view: AssetTimeView,
  aggregation: AssetAggregation,
): string {
  const nouns: Record<
    AssetTimeView,
    Record<AssetAggregation, { singular: string; plural: string }>
  > = {
    year: {
      combined: { singular: "monthly total", plural: "monthly totals" },
      raw: { singular: "daily total", plural: "daily totals" },
    },
    month: {
      combined: { singular: "daily total", plural: "daily totals" },
      raw: { singular: "hourly interval", plural: "hourly intervals" },
    },
    day: {
      combined: { singular: "hourly total", plural: "hourly totals" },
      raw: { singular: "quarter-hour interval", plural: "quarter-hour intervals" },
    },
  };
  const noun = nouns[view][aggregation];
  return `${count.toLocaleString("en")} ${count === 1 ? noun.singular : noun.plural}`;
}
