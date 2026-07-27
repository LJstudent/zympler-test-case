import type { GridAggregation, GridMetric, GridTimeView } from "../types/grid-types";

export function formatGridValue(value: number, metric: GridMetric): string {
  const unit = metric === "power" ? "kW" : "kWh";
  const absolute = Math.abs(value);
  const maximumFractionDigits = absolute >= 100 ? 0 : absolute >= 10 ? 1 : 2;
  return `${value.toLocaleString("en", { maximumFractionDigits })} ${unit}`;
}

type GridDateFormat = {
  day?: "numeric";
  month?: "long";
  year?: "numeric";
  hour?: "2-digit";
  minute?: "2-digit";
};

const TOOLTIP_DATE_FORMATS: Record<GridTimeView, Record<GridAggregation, GridDateFormat>> = {
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

export function formatGridTooltipTimestamp(
  date: Date,
  view: GridTimeView,
  aggregation: GridAggregation,
): string {
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

export function formatGridAxisTimestamp(
  date: Date,
  view: GridTimeView,
  aggregation: GridAggregation,
): string {
  if (view === "year" && aggregation === "combined") {
    return new Intl.DateTimeFormat("en-GB", {
      month: "short",
      timeZone: "UTC",
    }).format(date);
  }

  if (view === "year") {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(date);
  }

  if (view === "month") {
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
