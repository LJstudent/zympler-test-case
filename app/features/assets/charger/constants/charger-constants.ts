import { ASSET_BLUE_PALETTE, ENERGY_FLOW_COLORS } from "../../shared";
import type { ChargerChartSeries } from "../types/charger-types";

export const COMBINED_CHARGER_SERIES: readonly ChargerChartSeries[] = [
  {
    key: "totalCharged",
    label: "Charged energy",
    color: ASSET_BLUE_PALETTE.dark,
  },
];

export const BREAKDOWN_CHARGER_SERIES: readonly ChargerChartSeries[] = [
  {
    key: "solarToCharger",
    label: "Solar → Charger",
    color: ENERGY_FLOW_COLORS.solarProduction,
    stackId: "charger",
    stackPosition: "bottom",
  },
  {
    key: "batterySolarToCharger",
    label: "Battery → Charger (Solar)",
    color: ENERGY_FLOW_COLORS.batterySolarOrigin,
    stackId: "charger",
  },
  {
    key: "batteryGridToCharger",
    label: "Battery → Charger (Grid)",
    color: ENERGY_FLOW_COLORS.batteryGridOrigin,
    stackId: "charger",
  },
  {
    key: "gridToCharger",
    label: "Grid → Charger",
    color: ENERGY_FLOW_COLORS.toCharger,
    stackId: "charger",
    stackPosition: "top",
  },
];

export const CHARGER_BREAKDOWN_TOLERANCE_KWH = 0.01;
