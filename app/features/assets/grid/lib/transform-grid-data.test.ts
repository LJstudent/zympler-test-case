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
