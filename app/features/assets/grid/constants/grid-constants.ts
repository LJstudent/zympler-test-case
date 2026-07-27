import type { GridChartSeries, GridTimeView } from "../types/grid-types";

export const GRID_CAPACITY_LIMITS = {
  importKw: 750,
  exportKw: 500,
} as const;

export const GRID_TIME_VIEWS: readonly { value: GridTimeView; label: string }[] = [
  { value: "year", label: "Year" },
  { value: "month", label: "Month" },
  { value: "day", label: "Day" },
];

export const DEFAULT_GRID_SERIES: readonly GridChartSeries[] = [
  { key: "gridImport", label: "Grid Import", color: "#315fa8" },
  { key: "gridExport", label: "Grid Export", color: "#7f9cc8" },
];

export const BREAKDOWN_GRID_SERIES: readonly GridChartSeries[] = [
  {
    key: "solarToGrid",
    label: "Solar → Grid",
    color: "#FBBF24", // Amber 400
    stackId: "grid",
  },
  {
    key: "solarBatteryToGrid",
    label: "Battery (Solar) → Grid",
    color: "#A78BFA", // Violet 300
    stackId: "grid",
  },
  {
    key: "gridBatteryToGrid",
    label: "Battery (Grid) → Grid",
    color: "#7C3AED", // Violet 600
    stackId: "grid",
  },

  {
    key: "gridToBattery",
    label: "Grid → Battery",
    color: "#22C55E", // Green 500
    stackId: "grid",
  },
  {
    key: "gridToCharger",
    label: "Grid → Charger",
    color: "#0EA5E9", // Sky 500
    stackId: "grid",
  },
  {
    key: "ownUse",
    label: "Own Use",
    color: "#CBD5E1", // Slate 300
    stackId: "grid",
  },
];

export const GRID_EXPLANATIONS = {
  energy: "Amount of electricity transferred during the selected interval (kWh).",
  power:
    "Instantaneous grid load during each 15-minute interval (kW). Power is used to detect contracted-capacity violations.",
  powerDisabled:
    "Power is only available in Raw mode because contracted-capacity violations are measured on individual 15-minute intervals.",
  signs:
    "Exported energy is displayed below the zero axis using negative values. Imported energy is displayed above the zero axis.",
} as const;
