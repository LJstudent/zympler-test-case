import type { AssetAggregation, AssetTimeView } from "../types/asset-detail-types";

export const ASSET_TIME_VIEWS: readonly { value: AssetTimeView; label: string }[] = [
  { value: "year", label: "Year" },
  { value: "month", label: "Month" },
  { value: "day", label: "Day" },
];

export const ASSET_AGGREGATIONS: readonly { value: AssetAggregation; label: string }[] = [
  { value: "raw", label: "Raw" },
  { value: "combined", label: "Combined" },
];

export const ASSET_CHART = {
  heightRem: 24,
  animationDurationMs: 420,
  dayMaxBarSize: 14,
  defaultMaxBarSize: 28,
  rawMonthMaxBarSize: 2,
} as const;

export const ASSET_BLUE_PALETTE = {
  darkest: "#003ed0",
  dark: "#315fa8",
  medium: "#5f82b8",
  light: "#7f9cc8",
  pale: "#bdd2ff",
} as const;
