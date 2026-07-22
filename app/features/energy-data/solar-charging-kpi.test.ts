import { describe, expect, it } from "vitest";

import { calculateSolarChargingKpi } from "./solar-charging-kpi";

function createTotals(
  totalSolarToChargerKwh: number,
  totalGridToChargerKwh: number,
  chargerEnergyKwh = totalSolarToChargerKwh + totalGridToChargerKwh,
) {
  return { totalSolarToChargerKwh, totalGridToChargerKwh, chargerEnergyKwh };
}

describe("calculateSolarChargingKpi", () => {
  it("uses solar divided by combined solar and grid charging energy", () => {
    const result = calculateSolarChargingKpi(createTotals(20, 80));

    expect(result.solarPercentage).toBe(20);
    expect(result.gridPercentage).toBe(80);
    expect(result.totalChargingEnergyKwh).toBe(100);
  });

  it("does not use total solar generation as the denominator", () => {
    const totals = { ...createTotals(25, 75), solarGenerationKwh: 1_000_000 };

    expect(calculateSolarChargingKpi(totals).solarPercentage).toBe(25);
  });

  it("supports a measured zero-percent solar share", () => {
    const result = calculateSolarChargingKpi(createTotals(0, 50));

    expect(result.hasChargingEnergy).toBe(true);
    expect(result.solarPercentage).toBe(0);
  });

  it("distinguishes no charging energy from a measured result", () => {
    const result = calculateSolarChargingKpi(createTotals(0, 0));

    expect(result.hasChargingEnergy).toBe(false);
    expect(result.solarPercentage).toBe(0);
  });

  it("accepts small rounding differences in the charger total", () => {
    expect(calculateSolarChargingKpi(createTotals(20, 80, 100.009)).isDataConsistent).toBe(true);
  });

  it("flags meaningful total mismatches without blocking the calculation", () => {
    const result = calculateSolarChargingKpi(createTotals(20, 80, 90));

    expect(result.isDataConsistent).toBe(false);
    expect(result.solarPercentage).toBe(20);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -10])(
    "normalizes invalid solar energy %s without producing a non-finite percentage",
    (invalidValue) => {
      const result = calculateSolarChargingKpi(createTotals(invalidValue, 50, 50));

      expect(result.isInputValid).toBe(false);
      expect(result.solarPercentage).toBe(0);
      expect(Number.isFinite(result.solarPercentage)).toBe(true);
    },
  );
});
