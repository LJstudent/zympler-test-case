import { describe, expect, it } from "vitest";

import type { EnergyDataRow } from "~/features/energy-data";

import {
  buildSignedBatteryActivity,
  calculateDailyBatteryProfit,
  calculateIntervalBatteryProfit,
  createBatteryAssetCardViewModel,
  formatBatteryProfit,
} from "./battery-asset-card-view-model";

function batteryRow(
  start: string,
  chargedKwh: number,
  dischargedKwh: number,
  pricePerKwh: number | null,
): EnergyDataRow {
  return {
    start: new Date(start),
    end: new Date(new Date(start).getTime() + 15 * 60 * 1_000),
    measurement: {
      hbe: 0,
      pricePerKwh,
      gridImportKwh: 0,
      gridExportKwh: 0,
      solarGenerationKwh: 0,
      batteryChargeKwh: chargedKwh,
      batteryDischargeKwh: dischargedKwh,
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

describe("battery asset card view model", () => {
  it("selects the latest valid day and sorts signed activity chronologically", () => {
    const viewModel = createBatteryAssetCardViewModel([
      batteryRow("2025-12-31T00:15:00Z", 4, 0, 0.1),
      batteryRow("2025-12-30T23:45:00Z", 20, 0, 0.2),
      batteryRow("2025-12-31T00:00:00Z", 0, 10, 0.25),
      batteryRow("2026-01-01T00:00:00Z", -1, 0, 0.1),
    ]);

    expect(viewModel?.activity).toEqual([
      {
        timestamp: new Date("2025-12-31T00:00:00Z").getTime(),
        batteryActivityKwh: 10,
      },
      {
        timestamp: new Date("2025-12-31T00:15:00Z").getTime(),
        batteryActivityKwh: -4,
      },
    ]);
    expect(viewModel?.profitDisplay.replace(/\s/g, " ")).toBe("€ 2,10");
  });

  it("calculates revenue minus cost for each priced interval before summing", () => {
    const discharge = batteryRow("2025-12-31T00:00:00Z", 0, 10, 0.25);
    const charge = batteryRow("2025-12-31T00:15:00Z", 4, 0, 0.1);

    expect(calculateIntervalBatteryProfit(discharge)).toBe(2.5);
    expect(calculateIntervalBatteryProfit(charge)).toBe(-0.4);
    expect(calculateDailyBatteryProfit([discharge, charge])).toBe(2.1);
  });

  it("excludes unpriced intervals without failing priced activity", () => {
    const rows = [
      batteryRow("2025-12-31T00:00:00Z", 2, 0, null),
      batteryRow("2025-12-31T00:15:00Z", 0, 5, 0.2),
    ];

    expect(calculateDailyBatteryProfit(rows)).toBe(1);
    expect(buildSignedBatteryActivity(rows).map((point) => point.batteryActivityKwh)).toEqual([
      -2, 5,
    ]);
  });

  it("distinguishes zero profit, unavailable prices, and invalid measurements", () => {
    expect(
      createBatteryAssetCardViewModel([
        batteryRow("2025-12-31T00:00:00Z", 5, 5, 0.2),
      ])?.profitDisplay.replace(/\s/g, " "),
    ).toBe("€ 0,00");

    expect(
      createBatteryAssetCardViewModel([batteryRow("2025-12-31T00:00:00Z", 5, 0, null)]),
    ).toMatchObject({ profitDisplay: "—" });

    expect(
      createBatteryAssetCardViewModel([batteryRow("2025-12-31T00:00:00Z", Number.NaN, -1, 0.2)]),
    ).toBeNull();
  });

  it("keeps negative currency values visibly negative", () => {
    expect(formatBatteryProfit(-12.48).replace(/\s/g, " ")).toBe("€ −12,48");
  });
});
