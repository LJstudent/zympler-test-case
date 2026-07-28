import { ASSET_BLUE_PALETTE, ENERGY_FLOW_COLORS } from "../../shared";
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
  { key: "gridImport", label: "Grid Import", color: ASSET_BLUE_PALETTE.dark },
  { key: "gridExport", label: "Grid Export", color: ASSET_BLUE_PALETTE.light },
];

export const BREAKDOWN_GRID_SERIES: readonly GridChartSeries[] = [
  {
    key: "solarToGrid",
    label: "Solar → Grid",
    color: ENERGY_FLOW_COLORS.solarToGrid,
    stackId: "grid",
    stackPosition: "bottom",
  },
  {
    key: "solarBatteryToGrid",
    label: "Battery (Solar) → Grid",
    color: ENERGY_FLOW_COLORS.solarBatteryToGrid,
    stackId: "grid",
  },
  {
    key: "gridBatteryToGrid",
    label: "Battery (Grid) → Grid",
    color: ENERGY_FLOW_COLORS.gridBatteryToGrid,
    stackId: "grid",
  },

  {
    key: "gridToBattery",
    label: "Grid → Battery",
    color: ENERGY_FLOW_COLORS.toBattery,
    stackId: "grid",
  },
  {
    key: "gridToCharger",
    label: "Grid → Charger",
    color: ENERGY_FLOW_COLORS.toCharger,
    stackId: "grid",
  },
  {
    key: "ownUse",
    label: "Own Use",
    color: ENERGY_FLOW_COLORS.ownUse,
    stackId: "grid",
    stackPosition: "top",
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
