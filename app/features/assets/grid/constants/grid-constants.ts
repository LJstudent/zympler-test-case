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
  { key: "gridImport", label: "Grid Import", color: "#003ed0" },
  { key: "gridExport", label: "Grid Export", color: "#00b878" },
];

export const BREAKDOWN_GRID_SERIES: readonly GridChartSeries[] = [
  { key: "solarToGrid", label: "Solar → Grid", color: "#00c987", stackId: "grid" },
  {
    key: "solarBatteryToGrid",
    label: "Battery (Solar) → Grid",
    color: "#38bdf8",
    stackId: "grid",
  },
  {
    key: "gridBatteryToGrid",
    label: "Battery (Grid) → Grid",
    color: "#818cf8",
    stackId: "grid",
  },
  { key: "gridToBattery", label: "Grid → Battery", color: "#003ed0", stackId: "grid" },
  { key: "gridToCharger", label: "Grid → Charger", color: "#7c3aed", stackId: "grid" },
  { key: "ownUse", label: "Own Use", color: "#f59e0b", stackId: "grid" },
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
