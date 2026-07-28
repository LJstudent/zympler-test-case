import type { EnergyDataRow } from "~/features/energy-data";

import { GRID_CAPACITY_LIMITS } from "../constants/grid-constants";
import type { GridKpiSummary } from "../types/grid-kpi-types";
import type { GridTimeView } from "../types/grid-types";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

function dateKey(date: Date, view: GridTimeView): string | null {
  if (!Number.isFinite(date.getTime())) return null;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  if (view === "year") return String(year);
  if (view === "month") return `${year}-${month}`;
  return `${year}-${month}-${day}`;
}

function validNonNegative(value: number | null): number | null {
  return value !== null && Number.isFinite(value) ? Math.max(value, 0) : null;
}

function intervalHours(row: EnergyDataRow): number | null {
  const duration = row.end.getTime() - row.start.getTime();
  return Number.isFinite(duration) && duration > 0 ? duration / HOUR_MS : null;
}

export function selectGridPeriodRows(
  rows: readonly EnergyDataRow[],
  timeView: GridTimeView,
  periodKey: string,
): EnergyDataRow[] {
  return rows.filter((row) => dateKey(row.start, timeView) === periodKey);
}

export function calculateGridKpis(rows: readonly EnergyDataRow[]): GridKpiSummary {
  let importedEnergyKwh = 0;
  let exportedEnergyKwh = 0;
  let validImportEnergyCount = 0;
  let validExportEnergyCount = 0;
  let validMeasurementCount = 0;
  let peakImportKw: number | null = null;
  let peakExportKw: number | null = null;
  let importViolationCount = 0;
  let exportViolationCount = 0;
  let durationAboveNinetyPercentMinutes = 0;
  let validImportDurationCount = 0;
  const dailyPeaks = new Map<string, { date: Date; peakImportKw: number }>();
  const nearCapacityDays = new Set<string>();
  const nearCapacityThreshold = GRID_CAPACITY_LIMITS.importKw * 0.9;
  let batteryImportEnergyKwh = 0;
  let chargerImportEnergyKwh = 0;
  let solarExportEnergyKwh = 0;
  let batteryExportEnergyKwh = 0;

  for (const row of rows) {
    const importKwh = validNonNegative(row.measurement.gridImportKwh);
    const exportKwh = validNonNegative(row.measurement.gridExportKwh);
    const durationHours = intervalHours(row);
    const day = dateKey(row.start, "day");

    if (importKwh !== null || exportKwh !== null) validMeasurementCount += 1;
    if (importKwh !== null) {
      importedEnergyKwh += importKwh;
      validImportEnergyCount += 1;
      batteryImportEnergyKwh += validFlow(row.flows.grid.toBatteryKwh);
      chargerImportEnergyKwh += validFlow(row.flows.grid.toChargerKwh);
    }
    if (exportKwh !== null) {
      exportedEnergyKwh += exportKwh;
      validExportEnergyCount += 1;
      solarExportEnergyKwh += validFlow(row.flows.solar.toGridKwh);
      batteryExportEnergyKwh +=
        validFlow(row.flows.battery.solarOrigin.toGridKwh) +
        validFlow(row.flows.battery.gridOrigin.toGridKwh);
    }
    if (durationHours === null) continue;

    if (importKwh !== null) {
      const importKw = importKwh / durationHours;
      peakImportKw = peakImportKw === null ? importKw : Math.max(peakImportKw, importKw);
      validImportDurationCount += 1;
      if (importKw > GRID_CAPACITY_LIMITS.importKw) importViolationCount += 1;
      if (importKw > nearCapacityThreshold) {
        durationAboveNinetyPercentMinutes += durationHours * 60;
        if (day !== null) nearCapacityDays.add(day);
      }
      if (day !== null) {
        const existing = dailyPeaks.get(day);
        if (existing === undefined || importKw > existing.peakImportKw) {
          dailyPeaks.set(day, { date: new Date(row.start.getTime()), peakImportKw: importKw });
        }
      }
    }
    if (exportKwh !== null) {
      const exportKw = exportKwh / durationHours;
      peakExportKw = peakExportKw === null ? exportKw : Math.max(peakExportKw, exportKw);
      if (exportKw > GRID_CAPACITY_LIMITS.exportKw) exportViolationCount += 1;
    }
  }

  const sortedDailyPeaks = [...dailyPeaks.values()].sort(
    (a, b) => b.peakImportKw - a.peakImportKw || a.date.getTime() - b.date.getTime(),
  );
  const averageDailyPeakImportKw =
    sortedDailyPeaks.length === 0
      ? null
      : sortedDailyPeaks.reduce((sum, item) => sum + item.peakImportKw, 0) /
        sortedDailyPeaks.length;
  const remainingImportHeadroomKw =
    peakImportKw === null ? null : Math.max(0, GRID_CAPACITY_LIMITS.importKw - peakImportKw);
  const importLimitExceededByKw =
    peakImportKw === null ? null : Math.max(0, peakImportKw - GRID_CAPACITY_LIMITS.importKw);
  const importedBreakdown =
    validImportEnergyCount === 0 || importedEnergyKwh <= 0
      ? []
      : createImportedBreakdown(importedEnergyKwh, batteryImportEnergyKwh, chargerImportEnergyKwh);
  const exportedBreakdown =
    validExportEnergyCount === 0 || exportedEnergyKwh <= 0
      ? []
      : createExportedBreakdown(exportedEnergyKwh, batteryExportEnergyKwh, solarExportEnergyKwh);

  return {
    measurementCount: validMeasurementCount,
    importedEnergyKwh: validImportEnergyCount === 0 ? null : importedEnergyKwh,
    exportedEnergyKwh: validExportEnergyCount === 0 ? null : exportedEnergyKwh,
    peakImportKw,
    peakExportKw,
    importViolationCount,
    exportViolationCount,
    daysAboveNinetyPercentCapacity: nearCapacityDays.size,
    averageDailyPeakImportKw,
    worstDay: sortedDailyPeaks[0] ?? null,
    remainingImportHeadroomKw,
    importLimitExceededByKw,
    durationAboveNinetyPercentMinutes:
      validImportDurationCount === 0 ? null : durationAboveNinetyPercentMinutes,
    importedBreakdown,
    exportedBreakdown,
  };
}

function validFlow(value: number): number {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}

function percentage(energyKwh: number, totalKwh: number): number {
  return totalKwh > 0 ? (energyKwh / totalKwh) * 100 : 0;
}

function createImportedBreakdown(
  totalKwh: number,
  batteryKwh: number,
  chargerKwh: number,
): GridKpiSummary["importedBreakdown"] {
  const knownTotal = batteryKwh + chargerKwh;
  const scale = knownTotal > totalKwh && knownTotal > 0 ? totalKwh / knownTotal : 1;
  const reconciledBattery = batteryKwh * scale;
  const reconciledCharger = chargerKwh * scale;
  const ownUse = Math.max(totalKwh - reconciledBattery - reconciledCharger, 0);
  const items = [
    { id: "battery" as const, energyKwh: reconciledBattery },
    { id: "own-use" as const, energyKwh: ownUse },
    { id: "charger" as const, energyKwh: reconciledCharger },
  ];

  return items.map((item) => ({ ...item, percentage: percentage(item.energyKwh, totalKwh) }));
}

function createExportedBreakdown(
  totalKwh: number,
  batteryKwh: number,
  solarKwh: number,
): GridKpiSummary["exportedBreakdown"] {
  const knownTotal = batteryKwh + solarKwh;
  const reconciledBattery = knownTotal > 0 ? (batteryKwh / knownTotal) * totalKwh : 0;
  const reconciledSolar = totalKwh - reconciledBattery;
  const items = [
    { id: "battery" as const, energyKwh: reconciledBattery },
    { id: "solar" as const, energyKwh: reconciledSolar },
  ];

  return items.map((item) => ({ ...item, percentage: percentage(item.energyKwh, totalKwh) }));
}
