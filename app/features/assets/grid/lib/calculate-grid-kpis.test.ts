import { describe, expect, it } from "vitest";

import type { EnergyDataRow } from "~/features/energy-data";

import { GRID_CAPACITY_LIMITS } from "../constants/grid-constants";
import { calculateGridKpis, selectGridPeriodRows } from "./calculate-grid-kpis";

function row(
  start: string,
  importKwh: number | null,
  exportKwh: number | null,
  durationMinutes = 15,
): EnergyDataRow {
  const startDate = new Date(start);
  return {
    start: startDate,
    end: new Date(startDate.getTime() + durationMinutes * 60_000),
    measurement: {
      hbe: 0,
      pricePerKwh: null,
      gridImportKwh: importKwh,
      gridExportKwh: exportKwh,
      solarGenerationKwh: 0,
      batteryChargeKwh: 0,
      batteryDischargeKwh: 0,
      chargerEnergyKwh: 0,
      batterySoc: { solarOrigin: null, gridOrigin: null },
    },
    flows: {
      solar: { toBatteryKwh: 0, toGridKwh: 0, toChargerKwh: 0 },
      grid: { toBatteryKwh: 0, toChargerKwh: 0 },
      battery: {
        solarOrigin: { toGridKwh: 0, toChargerKwh: 0 },
        gridOrigin: { toGridKwh: 0, toChargerKwh: 0 },
      },
      charger: { totalFromSolarKwh: 0, totalFromGridKwh: 0 },
    },
  };
}

describe("calculateGridKpis", () => {
  it("calculates shared totals, peaks, and directional violations from interval data", () => {
    const summary = calculateGridKpis([
      row("2025-01-01T00:00:00Z", 200, 130),
      row("2025-01-01T00:15:00Z", 100, 25),
    ]);

    expect(summary.importedEnergyKwh).toBe(300);
    expect(summary.exportedEnergyKwh).toBe(155);
    expect(summary.peakImportKw).toBe(800);
    expect(summary.peakExportKw).toBe(520);
    expect(summary.importViolationCount).toBe(1);
    expect(summary.exportViolationCount).toBe(1);
  });

  it("counts a near-capacity calendar day once despite multiple intervals", () => {
    const summary = calculateGridKpis([
      row("2025-01-01T00:00:00Z", 180, 0),
      row("2025-01-01T00:15:00Z", 190, 0),
      row("2025-01-02T00:00:00Z", 170, 0),
    ]);

    expect(summary.daysAboveNinetyPercentCapacity).toBe(2);
  });

  it("calculates average daily peaks and chooses the earliest tied worst day", () => {
    const summary = calculateGridKpis([
      row("2025-11-22T12:00:00Z", 150, 0),
      row("2025-11-21T12:00:00Z", 150, 0),
      row("2025-11-23T12:00:00Z", 100, 0),
    ]);

    expect(summary.averageDailyPeakImportKw).toBeCloseTo((600 + 600 + 400) / 3);
    expect(summary.worstDay?.date.toISOString()).toBe("2025-11-21T12:00:00.000Z");
    expect(summary.worstDay?.peakImportKw).toBe(600);
  });

  it("calculates day headroom and real quarter-hour duration above 90%", () => {
    const summary = calculateGridKpis([
      row("2025-01-01T00:00:00Z", 180, 0, 15),
      row("2025-01-01T00:15:00Z", 350, 0, 30),
      row("2025-01-01T00:45:00Z", 100, 0, 15),
    ]);

    expect(summary.remainingImportHeadroomKw).toBe(30);
    expect(summary.importLimitExceededByKw).toBe(0);
    expect(summary.durationAboveNinetyPercentMinutes).toBe(45);
  });

  it("never exposes negative headroom and reports the exceeded amount", () => {
    const summary = calculateGridKpis([row("2025-01-01T00:00:00Z", 200, 0)]);

    expect(summary.remainingImportHeadroomKw).toBe(0);
    expect(summary.importLimitExceededByKw).toBe(50);
  });

  it("preserves valid zero measurements and unavailable malformed values", () => {
    const invalid = row("2025-01-01T00:00:00Z", Number.NaN, null);
    invalid.end = new Date(Number.NaN);
    const zero = calculateGridKpis([row("2025-01-01T00:15:00Z", 0, 0)]);
    const unavailable = calculateGridKpis([invalid]);

    expect(zero.importedEnergyKwh).toBe(0);
    expect(zero.peakImportKw).toBe(0);
    expect(unavailable.importedEnergyKwh).toBeNull();
    expect(unavailable.exportedEnergyKwh).toBeNull();
    expect(unavailable.peakImportKw).toBeNull();
    expect(unavailable.durationAboveNinetyPercentMinutes).toBeNull();
  });

  it("handles empty input without dividing by zero", () => {
    const summary = calculateGridKpis([]);

    expect(summary.measurementCount).toBe(0);
    expect(summary.averageDailyPeakImportKw).toBeNull();
    expect(summary.worstDay).toBeNull();
  });

  it("selects only rows in the requested UTC period and ignores invalid dates", () => {
    const invalid = row("invalid", 1, 1);
    const rows = [row("2025-01-01T00:00:00Z", 1, 1), row("2025-02-01T00:00:00Z", 1, 1), invalid];

    expect(selectGridPeriodRows(rows, "month", "2025-01")).toHaveLength(1);
    expect(selectGridPeriodRows(rows, "year", "2025")).toHaveLength(2);
  });

  it("derives the near-capacity threshold from the configured import limit", () => {
    const thresholdEnergy = GRID_CAPACITY_LIMITS.importKw * 0.9 * 0.25;
    const summary = calculateGridKpis([
      row("2025-01-01T00:00:00Z", thresholdEnergy, 0),
      row("2025-01-01T00:15:00Z", thresholdEnergy + 0.01, 0),
    ]);

    expect(summary.daysAboveNinetyPercentCapacity).toBe(1);
    expect(summary.durationAboveNinetyPercentMinutes).toBe(15);
  });

  it("reconciles imported breakdown flows to measured energy using raw values", () => {
    const measurement = row("2025-01-01T00:00:00Z", 100, 0);
    measurement.flows.grid.toBatteryKwh = 20;
    measurement.flows.grid.toChargerKwh = 30;

    const summary = calculateGridKpis([measurement]);

    expect(summary.importedBreakdown).toEqual([
      { id: "battery", energyKwh: 20, percentage: 20 },
      { id: "own-use", energyKwh: 50, percentage: 50 },
      { id: "charger", energyKwh: 30, percentage: 30 },
    ]);
    expect(summary.importedBreakdown.reduce((sum, item) => sum + item.percentage, 0)).toBeCloseTo(
      100,
    );
  });

  it("normalizes battery and solar export flows to measured exported energy", () => {
    const measurement = row("2025-01-01T00:00:00Z", 0, 100);
    measurement.flows.solar.toGridKwh = 25;
    measurement.flows.battery.solarOrigin.toGridKwh = 50;
    measurement.flows.battery.gridOrigin.toGridKwh = 25;

    const summary = calculateGridKpis([measurement]);

    expect(summary.exportedBreakdown).toEqual([
      { id: "battery", energyKwh: 75, percentage: 75 },
      { id: "solar", energyKwh: 25, percentage: 25 },
    ]);
  });

  it("returns no breakdown instead of fake zero values when totals are zero", () => {
    const summary = calculateGridKpis([row("2025-01-01T00:00:00Z", 0, 0)]);

    expect(summary.importedBreakdown).toEqual([]);
    expect(summary.exportedBreakdown).toEqual([]);
  });
});
