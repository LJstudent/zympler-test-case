import type { GridMetric, GridTimeView } from "../types/grid-types";

export function formatGridValue(value: number, metric: GridMetric): string {
  const unit = metric === "power" ? "kW" : "kWh";
  const absolute = Math.abs(value);
  const maximumFractionDigits = absolute >= 100 ? 0 : absolute >= 10 ? 1 : 2;
  return `${value.toLocaleString("en", { maximumFractionDigits })} ${unit}`;
}

export function formatGridTimestamp(date: Date, view: GridTimeView): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: view === "year" ? undefined : "2-digit",
    minute: view === "day" ? "2-digit" : undefined,
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}
