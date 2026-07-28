import { describe, expect, it } from "vitest";

import type { EnergyDataRow } from "~/features/energy-data";
import { calculateBatteryAnalytics, calculateBatteryInterval } from "./calculate-battery-analytics";

function row({
  start = "2025-01-01T00:00:00Z",
  price = 0.2,
  charge = 8,
  discharge = 5,
  gridToBattery = 6,
  solarToBattery = 2,
  solarBatteryToGrid = 1,
  gridBatteryToGrid = 3,
  solarBatteryToCharger = 0.5,
  gridBatteryToCharger = 0.5,
}: {
  start?: string;
  price?: number | null;
  charge?: number;
  discharge?: number;
  gridToBattery?: number;
  solarToBattery?: number;
  solarBatteryToGrid?: number;
  gridBatteryToGrid?: number;
  solarBatteryToCharger?: number;
  gridBatteryToCharger?: number;
} = {}): EnergyDataRow {
  const startDate = new Date(start);
  return {
    start: startDate,
    end: new Date(startDate.getTime() + 15 * 60 * 1_000),
    measurement: {
      hbe: 0,
      pricePerKwh: price,
      gridImportKwh: 0,
      gridExportKwh: 0,
      solarGenerationKwh: 0,
      batteryChargeKwh: charge,
      batteryDischargeKwh: discharge,
      chargerEnergyKwh: 0,
      batterySoc: { solarOrigin: null, gridOrigin: null },
    },
    flows: {
      solar: { toBatteryKwh: solarToBattery, toGridKwh: 0, toChargerKwh: 0 },
      grid: { toBatteryKwh: gridToBattery, toChargerKwh: 0 },
      battery: {
        solarOrigin: {
          toGridKwh: solarBatteryToGrid,
          toChargerKwh: solarBatteryToCharger,
        },
        gridOrigin: {
          toGridKwh: gridBatteryToGrid,
          toChargerKwh: gridBatteryToCharger,
        },
      },
      charger: { totalFromSolarKwh: 0, totalFromGridKwh: 0 },
    },
  };
}

describe("calculateBatteryInterval", () => {
  it("reconciles measured Battery Import with Grid and Solar charging", () => {
    const interval = calculateBatteryInterval(row());
    expect(interval.batteryImportKwh).toBeCloseTo(
      interval.gridToBatteryKwh + interval.solarToBatteryKwh,
      12,
    );
    expect(interval.validationIssues).toHaveLength(0);
  });

  it("derives Own Use and reconciles measured Battery Export", () => {
    const interval = calculateBatteryInterval(
      row({
        discharge: 10,
        solarBatteryToGrid: 2,
        gridBatteryToGrid: 1,
        solarBatteryToCharger: 1,
        gridBatteryToCharger: 2,
      }),
    );
    expect(interval.batteryToOwnUseKwh).toBe(4);
    expect(interval.batteryExportKwh).toBeCloseTo(
      interval.batteryToGridKwh + interval.batteryToChargerKwh + interval.batteryToOwnUseKwh,
      12,
    );
  });

  it("reports rather than clamps a meaningful negative Own Use balance", () => {
    const interval = calculateBatteryInterval(row({ discharge: 2 }));
    expect(interval.batteryToOwnUseKwh).toBe(-3);
    expect(interval.validationIssues).toEqual([
      expect.objectContaining({ code: "battery-export-mismatch", differenceKwh: -3 }),
    ]);
  });

  it("calculates Revenue, Savings, grid charging Costs, and Profit at interval price", () => {
    const interval = calculateBatteryInterval(row());
    expect(interval.revenueEur).toBeCloseTo(4 * 0.2, 12);
    expect(interval.savingsEur).toBeCloseTo(1 * 0.2, 12);
    expect(interval.gridChargingCostsEur).toBeCloseTo(6 * 0.2, 12);
    expect(interval.intervalProfitEur).toBeCloseTo(4 * 0.2 + 1 * 0.2 - 6 * 0.2, 12);
  });

  it("assigns solar charging an electricity purchase cost of zero", () => {
    const interval = calculateBatteryInterval(
      row({ charge: 8, gridToBattery: 0, solarToBattery: 8, price: 0.4 }),
    );
    expect(interval.gridChargingCostsEur).toBe(0);
  });

  it("preserves negative market prices", () => {
    const interval = calculateBatteryInterval(row({ price: -0.1 }));
    expect(interval.revenueEur).toBeCloseTo(-0.4, 12);
    expect(interval.savingsEur).toBeCloseTo(-0.1, 12);
    expect(interval.gridChargingCostsEur).toBeCloseTo(-0.6, 12);
    expect(interval.intervalProfitEur).toBeCloseTo(0.1, 12);
  });

  it("does not invent financial values when the price is missing", () => {
    const interval = calculateBatteryInterval(row({ price: null }));
    expect(interval.revenueEur).toBeNull();
    expect(interval.savingsEur).toBeNull();
    expect(interval.gridChargingCostsEur).toBeNull();
    expect(interval.intervalProfitEur).toBeNull();
  });
});

describe("calculateBatteryAnalytics", () => {
  const sourceRows = [
    row({ start: "2025-01-01T00:00:00Z", price: 0.2 }),
    row({
      start: "2025-01-01T00:15:00Z",
      price: 0.5,
      charge: 3,
      gridToBattery: 1,
      solarBatteryToGrid: 2,
      gridBatteryToGrid: 1,
    }),
    row({
      start: "2025-01-01T01:00:00Z",
      price: 0.1,
      charge: 2,
      gridToBattery: 0,
      solarBatteryToGrid: 4,
      gridBatteryToGrid: 0,
    }),
  ];

  it("sums interval financial values into display buckets", () => {
    const analytics = calculateBatteryAnalytics(sourceRows, "day", "combined", "2025-01-01");
    expect(analytics.points).toHaveLength(2);
    expect(analytics.points[0]).toMatchObject({
      batteryImport: 11,
      batteryExport: -10,
      gridToBattery: 7,
      solarToBattery: 4,
      batteryToGrid: -7,
      batteryToCharger: -2,
      batteryToOwnUse: -1,
    });
    expect(analytics.points[0].revenueEur).toBeCloseTo(2.3, 12);
    expect(analytics.points[0].savingsEur).toBeCloseTo(1.2, 12);
    expect(analytics.points[0].gridChargingCostsEur).toBeCloseTo(1.7, 12);
    expect(analytics.points[0].intervalProfitEur).toBeCloseTo(1.8, 12);
    expect(analytics.points[0].cumulativeProfit).toBeCloseTo(1.8, 12);
    expect(analytics.points[1].cumulativeProfit).toBeCloseTo(2.3, 12);
  });

  it("makes the final cumulative Profit equal Total Profit", () => {
    const analytics = calculateBatteryAnalytics(sourceRows, "day", "combined", "2025-01-01");
    expect(analytics.totalRevenueEur).toBeCloseTo(2.7, 12);
    expect(analytics.totalSavingsEur).toBeCloseTo(1.3, 12);
    expect(analytics.totalGridChargingCostsEur).toBeCloseTo(1.7, 12);
    expect(analytics.totalProfitEur).toBeCloseTo(2.3, 12);
    expect(analytics.points.at(-1)?.cumulativeProfit).toBeCloseTo(
      analytics.totalProfitEur ?? Number.NaN,
      12,
    );
  });

  it("keeps Raw points at the original Excel interval resolution", () => {
    const analytics = calculateBatteryAnalytics(sourceRows, "day", "raw", "2025-01-01");
    expect(analytics.points).toHaveLength(3);
    expect(analytics.points.map((point) => point.timestampMs)).toEqual(
      sourceRows.map((item) => item.start.getTime()),
    );
  });

  it("returns no selected-period financial total when any price is missing", () => {
    const analytics = calculateBatteryAnalytics(
      [row(), row({ start: "2025-01-01T00:15:00Z", price: null })],
      "day",
      "raw",
      "2025-01-01",
    );
    expect(analytics.points[0].cumulativeProfit).not.toBeNull();
    expect(analytics.points[1].cumulativeProfit).toBeNull();
    expect(analytics.totalProfitEur).toBeNull();
    expect(analytics.totalGridChargingCostsEur).toBeNull();
  });
});
