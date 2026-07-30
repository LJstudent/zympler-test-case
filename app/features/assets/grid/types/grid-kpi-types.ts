import type { GridTimeView } from "./grid-types";

export interface GridKpiSummary {
  measurementCount: number;
  importedEnergyKwh: number | null;
  exportedEnergyKwh: number | null;
  peakImportKw: number | null;
  peakExportKw: number | null;
  importViolationCount: number;
  exportViolationCount: number;
  daysAboveNinetyPercentCapacity: number;
  averageDailyPeakImportKw: number | null;
  worstDay: { date: Date; peakImportKw: number } | null;
  remainingImportHeadroomKw: number | null;
  importLimitExceededByKw: number | null;
  durationAboveNinetyPercentMinutes: number | null;
  importedBreakdown: GridBreakdownItem[];
  exportedBreakdown: GridBreakdownItem[];
}

export type GridBreakdownId = "battery" | "own-use" | "solar" | "charger";

export interface GridBreakdownItem {
  id: GridBreakdownId;
  energyKwh: number;
  percentage: number;
}

export type GridKpiId =
  | "imported-energy"
  | "exported-energy"
  | "peak-import"
  | "peak-export"
  | "import-violations"
  | "export-violations"
  | "days-near-capacity"
  | "average-daily-peak"
  | "worst-day"
  | "remaining-headroom"
  | "time-near-capacity";

export interface GridKpiPresentationItem {
  id: GridKpiId;
  label: string;
  tooltip: string;
  accessibleLabel: string;
  value: string;
  valueAvailable: boolean;
  supportingText?: string;
  context?: GridKpiContextLine[];
  iconSrc: string;
}

export interface GridKpiContextLine {
  text: string;
  tone: "muted" | "warning";
}

export interface GridBreakdownPresentationItem {
  id: GridBreakdownId;
  label: string;
  tooltip: string;
  accessibleLabel: string;
  value: string;
  percentageText: string;
  iconSrc: string;
}

export interface GridKpiPresentationInput {
  summary: GridKpiSummary;
  timeView: GridTimeView;
  locale?: string;
}
