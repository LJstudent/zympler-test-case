import { describe, expect, it } from "vitest";

import { selectAssetPeriodRows } from "../../shared";
import { calculateChargerKpis } from "./calculate-charger-kpis";
import { createChargerTestRow } from "./charger-test-data";

describe("calculateChargerKpis", () => {
  it("calculates total charged energy and solar charging from the total solar column", () => {
    const summary = calculateChargerKpis([
      createChargerTestRow({
        totalChargedKwh: 200,
        totalSolarToChargerKwh: 50,
        solarToChargerKwh: 20,
      }),
    ]);

    expect(summary.totalChargedKwh).toBe(200);
    expect(summary.totalSolarToChargerKwh).toBe(50);
    expect(summary.solarChargingPercentage).toBe(25);
  });

  it("returns null percentages when no charged energy is available", () => {
    const summary = calculateChargerKpis([
      createChargerTestRow({
        totalChargedKwh: 0,
        totalSolarToChargerKwh: 0,
        solarToChargerKwh: 0,
        batterySolarToChargerKwh: 0,
        batteryGridToChargerKwh: 0,
        gridToChargerKwh: 0,
      }),
    ]);

    expect(summary.solarChargingPercentage).toBeNull();
    expect(summary.breakdown.every((item) => item.percentage === null)).toBe(true);
  });

  it("calculates all breakdown percentages against total charged energy", () => {
    const summary = calculateChargerKpis([createChargerTestRow()]);

    expect(summary.breakdown).toEqual([
      { id: "solarToCharger", energyKwh: 20, percentage: 20 },
      { id: "batterySolarToCharger", energyKwh: 5, percentage: 5 },
      { id: "batteryGridToCharger", energyKwh: 15, percentage: 15 },
      { id: "gridToCharger", energyKwh: 60, percentage: 60 },
    ]);
  });

  it.each([
    ["year", "2025", 600],
    ["month", "2025-02", 500],
    ["day", "2025-02-03", 300],
  ] as const)("filters KPI totals for the active %s period", (view, periodKey, expected) => {
    const rows = [
      createChargerTestRow({ start: "2025-01-01T00:00:00Z", totalChargedKwh: 100 }),
      createChargerTestRow({ start: "2025-02-02T00:00:00Z", totalChargedKwh: 200 }),
      createChargerTestRow({ start: "2025-02-03T00:00:00Z", totalChargedKwh: 300 }),
      createChargerTestRow({ start: "2026-02-03T00:00:00Z", totalChargedKwh: 400 }),
    ];

    const selected = selectAssetPeriodRows(rows, view, periodKey);

    expect(calculateChargerKpis(selected).totalChargedKwh).toBe(expected);
  });

  it("treats all energy values as non-negative", () => {
    const summary = calculateChargerKpis([
      createChargerTestRow({
        totalChargedKwh: -100,
        totalSolarToChargerKwh: -20,
        solarToChargerKwh: -20,
        batterySolarToChargerKwh: -5,
        batteryGridToChargerKwh: -15,
        gridToChargerKwh: -60,
      }),
    ]);

    expect(summary.totalChargedKwh).toBe(0);
    expect(summary.totalSolarToChargerKwh).toBe(0);
    expect(summary.breakdown.every((item) => item.energyKwh === 0)).toBe(true);
  });
});
