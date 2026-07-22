export interface GridCapacityLimits {
  importKw: number;
  exportKw: number;
}

export type GridMeasurementUnit = "energy-kwh" | "power-kw";

export const SITE_GRID_CAPACITY_LIMITS: GridCapacityLimits = {
  importKw: 750,
  exportKw: 500,
};

export const GRID_MEASUREMENT_UNIT: GridMeasurementUnit = "energy-kwh";
