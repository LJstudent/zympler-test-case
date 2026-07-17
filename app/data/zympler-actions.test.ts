import { describe, expect, it } from "vitest";

import {
  getBatterySupplyDurationHours,
  getDailyZymplerActions,
  getDirectSolarEnergy,
  getGridCapacityMetrics,
  wattsToKilowatts,
  type EnergyRecord,
} from "./zympler-actions";

const record = (
  load: number,
  limit: number,
  overrides: Partial<EnergyRecord> = {},
): EnergyRecord => ({
  interval: { start: "2026-03-23T00:00:00Z", end: "2026-03-23T00:15:00Z" },
  from_grid: { power: load },
  from_grid_limit: { power: limit },
  ...overrides,
});

describe("grid capacity metrics", () => {
  it("converts W to kW", () => {
    expect(wattsToKilowatts(175_000)).toBe(175);
  });

  it("calculates peak load, limit, headroom and utilisation", () => {
    const metrics = getGridCapacityMetrics([record(400_000, 750_000), record(575_000, 750_000)]);

    expect(metrics.peakPlannedLoadWatts).toBe(575_000);
    expect(metrics.contractLimitWatts).toBe(750_000);
    expect(metrics.availableHeadroomWatts).toBe(175_000);
    expect(metrics.utilisationPercentage).toBeCloseTo(76.667);
    expect(metrics.status).toBe("within-limit");
  });

  it("reports an exceeded limit and clamps visual progress", () => {
    const metrics = getGridCapacityMetrics([record(800_000, 750_000)]);

    expect(metrics.status).toBe("exceeded");
    expect(metrics.availableHeadroomWatts).toBe(0);
    expect(metrics.exceededByWatts).toBe(50_000);
    expect(metrics.utilisationPercentage).toBeCloseTo(106.667);
    expect(metrics.progressPercentage).toBe(100);
  });

  it("uses the most restrictive positive limit when limits change", () => {
    const metrics = getGridCapacityMetrics([
      record(500_000, 750_000),
      record(550_000, 600_000),
      record(100_000, 0),
    ]);

    expect(metrics.contractLimitWatts).toBe(600_000);
    expect(metrics.availableHeadroomWatts).toBe(50_000);
  });

  it("handles an empty dataset", () => {
    expect(getGridCapacityMetrics([])).toMatchObject({
      peakPlannedLoadWatts: null,
      contractLimitWatts: null,
      availableHeadroomWatts: null,
      utilisationPercentage: null,
      status: "unavailable",
    });
    expect(getDailyZymplerActions([])).toEqual([]);
  });
});

describe("daily actions", () => {
  it("uses timestamp durations for battery supply", () => {
    const records = [
      record(0, 750_000, {
        interval: { start: "2026-03-23T01:00:00Z", end: "2026-03-23T01:20:00Z" },
        breakdown: { used_from_battery: { power: 10_000 } },
      }),
      record(0, 750_000, {
        interval: { start: "2026-03-23T02:00:00Z", end: "2026-03-23T02:40:00Z" },
        breakdown: { used_from_battery: { power: 20_000 } },
      }),
      record(0, 750_000, {
        interval: { start: "invalid", end: "2026-03-23T03:00:00Z" },
        breakdown: { used_from_battery: { power: 20_000 } },
      }),
    ];

    expect(getBatterySupplyDurationHours(records)).toBeCloseTo(1);
  });

  it("sums only positive directly consumed solar energy", () => {
    const records = [
      record(0, 750_000, { breakdown: { used_from_solar: { energy: 2_500 } } }),
      record(0, 750_000, { breakdown: { used_from_solar: { energy: 1_250 } } }),
      record(0, 750_000, { breakdown: { used_from_solar: { energy: -100 } } }),
    ];

    expect(getDirectSolarEnergy(records)).toBe(3_750);
    expect(getDailyZymplerActions([], records).some((action) => action.id === "solar-usage")).toBe(
      true,
    );
  });

  it("derives direct solar energy from power and timestamp when energy is missing", () => {
    const records = [
      record(0, 750_000, {
        interval: { start: "2026-03-23T09:00:00Z", end: "2026-03-23T09:30:00Z" },
        breakdown: { used_from_solar: { power: 10_000 } },
      }),
    ];

    expect(getDirectSolarEnergy(records)).toBe(5_000);
  });
});
