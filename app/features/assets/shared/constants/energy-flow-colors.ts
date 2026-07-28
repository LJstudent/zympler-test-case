/**
 * Semantic colors for energy sources and destinations.
 *
 * Detail pages must use these tokens so a flow keeps the same meaning and
 * color regardless of which asset is being viewed.
 */
export const ENERGY_FLOW_COLORS = {
  solarProduction: "#FBBF24",
  solarToGrid: "#FBBF24",
  gridSource: "#315fa8",
  toBattery: "#22C55E",
  toCharger: "#0EA5E9",
  ownUse: "#CBD5E1",
  solarBatteryToGrid: "#A78BFA",
  gridBatteryToGrid: "#7C3AED",
  batterySolarOrigin: "#A78BFA",
  batteryGridOrigin: "#7C3AED",
} as const;
