import { ENERGY_FLOW_COLORS } from "../../shared";
import type { SolarChartSeries } from "../types/solar-types";

export const DEFAULT_SOLAR_SERIES: readonly SolarChartSeries[] = [
  {
    key: "totalSolar",
    label: "Total production",
    color: ENERGY_FLOW_COLORS.solarProduction,
  },
];

export const BREAKDOWN_SOLAR_SERIES: readonly SolarChartSeries[] = [
  {
    key: "ownUse",
    label: "Own use",
    color: ENERGY_FLOW_COLORS.ownUse,
    stackId: "solar",
    stackPosition: "bottom",
  },
  {
    key: "solarToCharger",
    label: "Solar → Charger",
    color: ENERGY_FLOW_COLORS.toCharger,
    stackId: "solar",
  },
  {
    key: "solarToBattery",
    label: "Solar → Battery",
    color: ENERGY_FLOW_COLORS.toBattery,
    stackId: "solar",
  },
  {
    key: "solarToGrid",
    label: "Solar → Grid",
    color: ENERGY_FLOW_COLORS.solarToGrid,
    stackId: "solar",
    stackPosition: "top",
  },
];
