import { describe, expect, it } from "vitest";

import type { GridCapacityLimits, GridMeasurementUnit } from "./grid-capacity-config";
import { calculateGridComplianceKpi } from "./grid-compliance-kpi";
import type { GridMeasurementRow } from "./grid-compliance-kpi";

const limits: GridCapacityLimits = { importKw: 750, exportKw: 500 };
const FIFTEEN_MINUTES_MS = 15 * 60 * 1_000;

function row(
  importValue: number | null,
  exportValue: number | null,
  start = new Date("2025-03-18T14:15:00.000Z"),
  durationMs = FIFTEEN_MINUTES_MS,
): GridMeasurementRow {
  return {
    start,
    end: new Date(start.getTime() + durationMs),
    measurement: { gridImportKwh: importValue, gridExportKwh: exportValue },
  };
}

function calculate(rows: readonly GridMeasurementRow[], unit: GridMeasurementUnit = "power-kw") {
  return calculateGridComplianceKpi(rows, limits, unit);
}

describe("calculateGridComplianceKpi", () => {
  it.each([
    [749, 0],
    [750, 0],
  ])("treats import at or below the limit as compliant", (importKw, violations) => {
    const result = calculate([row(importKw, 0)]);

    expect(result.import.violationCount).toBe(violations);
    expect(result.compliancePercentage).toBe(100);
  });

  it("creates an import violation above the import limit", () => {
    const result = calculate([row(812, 0)]);

    expect(result.import.violationCount).toBe(1);
    expect(result.import.exceededByKw).toBe(62);
    expect(result.violations[0]).toMatchObject({
      direction: "import",
      measuredKw: 812,
      limitKw: 750,
      exceededByKw: 62,
    });
  });

  it.each([
    [499, 0],
    [500, 0],
  ])("treats export at or below the limit as compliant", (exportKw, violations) => {
    const result = calculate([row(0, exportKw)]);

    expect(result.export.violationCount).toBe(violations);
    expect(result.compliancePercentage).toBe(100);
  });

  it("creates an export violation above the export limit", () => {
    const result = calculate([row(0, 534)]);

    expect(result.export.violationCount).toBe(1);
    expect(result.export.exceededByKw).toBe(34);
    expect(result.violations[0]).toMatchObject({ direction: "export", limitKw: 500 });
  });

  it("counts both directional violations while marking one interval non-compliant once", () => {
    const result = calculate([row(800, 550), row(100, 100)]);

    expect(result.import.violationCount).toBe(1);
    expect(result.export.violationCount).toBe(1);
    expect(result.violations).toHaveLength(2);
    expect(result.compliantIntervals).toBe(1);
    expect(result.compliancePercentage).toBe(50);
  });

  it("bases compliance on intervals compliant in both directions, not violation records", () => {
    const result = calculate([row(800, 550), row(800, 0), row(0, 0)]);

    expect(result.violations).toHaveLength(3);
    expect(result.compliantIntervals).toBe(1);
    expect(result.compliancePercentage).toBeCloseTo(100 / 3);
  });

  it("retains the highest import and export peaks and their timestamps", () => {
    const first = new Date("2025-03-18T14:15:00.000Z");
    const second = new Date("2025-06-21T12:45:00.000Z");
    const result = calculate([row(812, 100, first), row(575, 534, second)]);

    expect(result.import.peakKw).toBe(812);
    expect(result.import.peakAt).toEqual(first);
    expect(result.export.peakKw).toBe(534);
    expect(result.export.peakAt).toEqual(second);
  });

  it("calculates directional exceedance and headroom independently", () => {
    const result = calculate([row(575, 534)]);

    expect(result.import.headroomKw).toBe(175);
    expect(result.import.exceededByKw).toBe(0);
    expect(result.export.headroomKw).toBe(0);
    expect(result.export.exceededByKw).toBe(34);
    expect(result.import.limitKw).toBe(750);
    expect(result.export.limitKw).toBe(500);
  });

  it("converts interval energy using the actual duration", () => {
    const halfHour = 30 * 60 * 1_000;
    const result = calculate([row(400, 250, undefined, halfHour)], "energy-kwh");

    expect(result.import.peakKw).toBe(800);
    expect(result.export.peakKw).toBe(500);
  });

  it("does not convert values already expressed as power", () => {
    const result = calculate([row(400, 250)], "power-kw");

    expect(result.import.peakKw).toBe(400);
    expect(result.export.peakKw).toBe(250);
  });

  it("returns an empty-data result when no valid measurements exist", () => {
    const invalidDate = new Date(Number.NaN);
    const result = calculate([
      row(null, 0),
      row(Number.NaN, 0),
      row(0, Number.POSITIVE_INFINITY),
      row(0, 0, invalidDate),
      row(0, 0, undefined, 0),
    ]);

    expect(result.hasValidMeasurements).toBe(false);
    expect(result.totalIntervals).toBe(0);
    expect(result.import.peakAt).toBeNull();
    expect(result.export.peakAt).toBeNull();
    expect(Number.isFinite(result.compliancePercentage)).toBe(true);
  });

  it("treats valid zero usage as fully compliant with full headroom", () => {
    const result = calculate([row(0, 0)]);

    expect(result.hasValidMeasurements).toBe(true);
    expect(result.compliancePercentage).toBe(100);
    expect(result.import.headroomKw).toBe(750);
    expect(result.export.headroomKw).toBe(500);
  });

  it("preserves full domain precision", () => {
    const result = calculate([row(750.123456, 123.456789)]);

    expect(result.import.peakKw).toBe(750.123456);
    expect(result.export.peakKw).toBe(123.456789);
  });
});
