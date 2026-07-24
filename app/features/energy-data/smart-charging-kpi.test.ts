import { describe, expect, it } from "vitest";

import { calculateSmartChargingKpi } from "./smart-charging-kpi";

function row(pricePerKwh: number | null, gridToChargerKwh: number) {
  return {
    measurement: { pricePerKwh },
    flows: { grid: { toChargerKwh: gridToChargerKwh } },
  };
}

describe("calculateSmartChargingKpi", () => {
  it("calculates top-20% avoidance and the energy-weighted charging price", () => {
    const result = calculateSmartChargingKpi([
      row(0.05, 10),
      row(0.1, 30),
      row(0.2, 10),
      row(0.3, 10),
      row(0.4, 0),
    ]);

    expect(result.averageMarketPricePerKwh).toBeCloseTo(0.21);
    expect(result.averageChargingPricePerKwh).toBeCloseTo(0.1416667);
    expect(result.totalChargingEnergyKwh).toBe(60);
    expect(result.energyDuringExpensivePeriodsKwh).toBe(0);
    expect(result.expensiveChargingPercentage).toBe(0);
    expect(result.peakPriceAvoidancePercentage).toBe(100);
  });

  it("uses every valid market price but only positive, directly priced grid charging energy", () => {
    const result = calculateSmartChargingKpi([
      row(0.05, 0),
      row(0.1, -10),
      row(0.15, 20),
      row(null, 100),
    ]);

    expect(result.averageMarketPricePerKwh).toBeCloseTo(0.1);
    expect(result.averageChargingPricePerKwh).toBeCloseTo(0.15);
    expect(result.totalChargingEnergyKwh).toBe(20);
  });

  it("returns a stable empty result without NaN or Infinity", () => {
    const result = calculateSmartChargingKpi([row(null, 10)]);

    expect(result.hasValidData).toBe(false);
    expect(result.peakPriceAvoidancePercentage).toBe(0);
    expect(
      Object.values(result).every((value) => typeof value !== "number" || Number.isFinite(value)),
    ).toBe(true);
  });

  it("selects exactly the highest-priced fifth of intervals with a deterministic tie break", () => {
    const result = calculateSmartChargingKpi([
      row(0.1, 10),
      row(0.5, 10),
      row(0.5, 30),
      row(0.2, 10),
      row(0.3, 10),
      row(0.4, 10),
      row(0.05, 10),
      row(0.15, 10),
      row(0.25, 10),
      row(0.35, 10),
    ]);

    expect(result.energyDuringExpensivePeriodsKwh).toBe(40);
    expect(result.totalChargingEnergyKwh).toBe(120);
    expect(result.expensiveChargingPercentage).toBeCloseTo(33.3333);
    expect(result.peakPriceAvoidancePercentage).toBeCloseTo(66.6667);
  });
});
