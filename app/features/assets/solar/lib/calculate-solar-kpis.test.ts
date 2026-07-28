import { describe, expect, it } from "vitest";

import type { EnergyDataRow } from "~/features/energy-data";

import { calculateSolarKpis } from "./calculate-solar-kpis";

function row({
  production = 100,
  ownDestinations = [20, 30, 10],
  price = 0.2,
}: {
  production?: number;
  ownDestinations?: readonly [number, number, number];
  price?: number | null;
} = {}): EnergyDataRow {
  const [toChargerKwh, toBatteryKwh, toGridKwh] = ownDestinations;
  return {
    start: new Date("2025-01-01T00:00:00Z"),
    end: new Date("2025-01-01T00:15:00Z"),
    measurement: {
      hbe: 0,
      pricePerKwh: price,
      gridImportKwh: 0,
      gridExportKwh: 0,
      solarGenerationKwh: production,
      batteryChargeKwh: 0,
      batteryDischargeKwh: 0,
      chargerEnergyKwh: 0,
      batterySoc: { solarOrigin: null, gridOrigin: null },
    },
    flows: {
      solar: { toBatteryKwh, toGridKwh, toChargerKwh },
      grid: { toBatteryKwh: 0, toChargerKwh: 0 },
      battery: {
        solarOrigin: { toGridKwh: 0, toChargerKwh: 0 },
        gridOrigin: { toGridKwh: 0, toChargerKwh: 0 },
      },
      charger: { totalFromSolarKwh: 0, totalFromGridKwh: 0 },
    },
  };
}

describe("calculateSolarKpis", () => {
  it("calculates local use, export and interval-priced breakdown values", () => {
    const summary = calculateSolarKpis([row()]);

    expect(summary.totalProductionKwh).toBe(100);
    expect(summary.localUseKwh).toBe(90);
    expect(summary.localUsePercentage).toBe(90);
    expect(summary.exportedKwh).toBe(10);
    expect(summary.exportedPercentage).toBe(10);
    expect(summary.breakdown).toEqual([
      { id: "ownUse", energyKwh: 40, estimatedValue: 8 },
      { id: "solarToCharger", energyKwh: 20, estimatedValue: 4 },
      { id: "solarToBattery", energyKwh: 30, estimatedValue: 6 },
      { id: "solarToGrid", energyKwh: 10, estimatedValue: 2 },
    ]);
  });

  it("uses each interval's market price instead of an average price", () => {
    const summary = calculateSolarKpis([
      row({ production: 10, ownDestinations: [0, 0, 10], price: 0.1 }),
      row({ production: 20, ownDestinations: [0, 0, 20], price: 0.3 }),
    ]);

    expect(summary.breakdown.find((flow) => flow.id === "solarToGrid")?.estimatedValue).toBe(7);
  });

  it("preserves negative market prices in the estimated value", () => {
    const summary = calculateSolarKpis([
      row({ production: 10, ownDestinations: [0, 0, 10], price: -0.1 }),
    ]);

    expect(summary.breakdown.find((flow) => flow.id === "solarToGrid")?.estimatedValue).toBe(-1);
  });

  it("returns safe percentages when production is zero", () => {
    const summary = calculateSolarKpis([
      row({ production: 0, ownDestinations: [1, 1, 1], price: null }),
    ]);

    expect(summary.localUsePercentage).toBe(0);
    expect(summary.exportedPercentage).toBe(0);
    expect(summary.breakdown.every((flow) => flow.energyKwh === 0)).toBe(true);
  });
});
