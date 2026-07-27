import { describe, expect, it } from "vitest";

import type { EnergyDataRow } from "~/features/energy-data";

import {
  calculateGridCapacityViolations,
  getGridPeriodOptions,
  transformGridData,
} from "./transform-grid-data";

function row(
  start: string,
  gridImportKwh: number,
  gridExportKwh: number,
  gridToBatteryKwh = 0,
  gridToChargerKwh = 0,
): EnergyDataRow {
  const startDate = new Date(start);
  return {
    start: startDate,
    end: new Date(startDate.getTime() + 15 * 60 * 1_000),
    measurement: {
      hbe: 0,
      pricePerKwh: null,
      gridImportKwh,
      gridExportKwh,
      solarGenerationKwh: 0,
      batteryChargeKwh: 0,
      batteryDischargeKwh: 0,
      chargerEnergyKwh: 0,
      batterySoc: { solarOrigin: null, gridOrigin: null },
    },
    flows: {
      solar: { toBatteryKwh: 0, toGridKwh: gridExportKwh / 2, toChargerKwh: 0 },
      grid: { toBatteryKwh: gridToBatteryKwh, toChargerKwh: gridToChargerKwh },
      battery: {
        solarOrigin: { toGridKwh: gridExportKwh / 4, toChargerKwh: 0 },
        gridOrigin: { toGridKwh: gridExportKwh / 4, toChargerKwh: 0 },
      },
      charger: { totalFromSolarKwh: 0, totalFromGridKwh: gridToChargerKwh },
    },
  };
}

describe("transformGridData", () => {
  const rows = [
    row("2025-01-01T00:00:00Z", 10, 4, 2, 3),
    row("2025-01-01T00:15:00Z", 6, 0, 1, 2),
    row("2025-02-02T00:00:00Z", 5, 2),
  ];

  it("creates newest-first options at every supported time resolution", () => {
    expect(getGridPeriodOptions(rows, "year").map((option) => option.key)).toEqual(["2025"]);
    expect(getGridPeriodOptions(rows, "month").map((option) => option.key)).toEqual([
      "2025-02",
      "2025-01",
    ]);
    expect(getGridPeriodOptions(rows, "day").map((option) => option.key)).toEqual([
      "2025-02-02",
      "2025-01-01",
    ]);
  });

  it("uses one bucket pipeline for monthly, daily, hourly and interval views", () => {
    const yearly = transformGridData(rows, "year", "combined", "energy", "2025");
    const monthly = transformGridData(rows, "month", "combined", "energy", "2025-01");
    const hourly = transformGridData(rows, "month", "raw", "energy", "2025-01");
    const intervals = transformGridData(rows, "day", "raw", "energy", "2025-01-01");

    expect(yearly).toHaveLength(2);
    expect(monthly).toHaveLength(1);
    expect(hourly).toHaveLength(1);
    expect(intervals).toHaveLength(2);
    expect(monthly[0]).toMatchObject({
      gridImport: 16,
      gridExport: -4,
      gridToBattery: 3,
      gridToCharger: 5,
      ownUse: 8,
      solarToGrid: -2,
      solarBatteryToGrid: -1,
      gridBatteryToGrid: -1,
    });
  });

  it("preserves the full timestamp on every Month Raw hourly datum", () => {
    const hourly = transformGridData(
      [row("2025-01-01T14:00:00Z", 1, 0), row("2025-01-02T09:00:00Z", 1, 0)],
      "month",
      "raw",
      "energy",
      "2025-01",
    );

    expect(hourly.map((datum) => datum.timestamp)).toEqual([
      "2025-01-01T14:00:00.000Z",
      "2025-01-02T09:00:00.000Z",
    ]);
    expect(hourly.map((datum) => datum.timestampMs)).toEqual([
      Date.parse("2025-01-01T14:00:00Z"),
      Date.parse("2025-01-02T09:00:00Z"),
    ]);
  });

  it("converts quarter-hour energy to power and marks limit violations", () => {
    const data = transformGridData(
      [row("2025-01-01T00:00:00Z", 200, 130)],
      "day",
      "raw",
      "power",
      "2025-01-01",
    );

    expect(data[0].gridImport).toBe(800);
    expect(data[0].gridExport).toBe(-520);
    expect(data[0].importViolation).toBe(true);
    expect(data[0].exportViolation).toBe(true);
  });

  it("reconciles positive and negative breakdowns to their measured totals", () => {
    const inconsistent = row("2025-01-01T00:00:00Z", 10, 12, 8, 7);
    inconsistent.flows.solar.toGridKwh = 2;
    inconsistent.flows.battery.solarOrigin.toGridKwh = 1;
    inconsistent.flows.battery.gridOrigin.toGridKwh = 1;

    const [datum] = transformGridData([inconsistent], "day", "raw", "energy", "2025-01-01");

    expect(datum.gridToCharger).toBeGreaterThanOrEqual(0);
    expect(datum.gridToBattery).toBeGreaterThanOrEqual(0);
    expect(datum.ownUse).toBe(0);
    expect(datum.gridToCharger + datum.gridToBattery + datum.ownUse).toBeCloseTo(
      datum.gridImport,
      12,
    );
    expect(datum.solarToGrid).toBeLessThanOrEqual(0);
    expect(datum.solarBatteryToGrid).toBeLessThanOrEqual(0);
    expect(datum.gridBatteryToGrid).toBeLessThanOrEqual(0);
    expect(datum.solarToGrid + datum.solarBatteryToGrid + datum.gridBatteryToGrid).toBeCloseTo(
      datum.gridExport,
      12,
    );
  });

  it("uses non-negative own use as the remainder of measured import", () => {
    const [datum] = transformGridData(
      [row("2025-01-01T00:00:00Z", 10, 0, 2, 3)],
      "day",
      "raw",
      "energy",
      "2025-01-01",
    );

    expect(datum.ownUse).toBe(5);
    expect(datum.ownUse).toBeGreaterThanOrEqual(0);
  });
});

describe("calculateGridCapacityViolations", () => {
  it("returns every violation newest first with the exceeded amount", () => {
    const violations = calculateGridCapacityViolations([
      row("2025-01-01T00:00:00Z", 200, 0),
      row("2025-01-02T00:00:00Z", 0, 130),
    ]);

    expect(violations.map((violation) => violation.direction)).toEqual(["export", "import"]);
    expect(violations[0]).toMatchObject({
      measuredKw: 520,
      limitKw: 500,
      exceededByKw: 20,
    });
  });
});
