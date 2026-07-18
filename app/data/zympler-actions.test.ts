import { describe, expect, it } from "vitest";

import {
  formatDashboardTime,
  getBatterySupplyDurationHours,
  getDailyZymplerActions,
  getDirectSolarEnergy,
  getGridExportCapacityMetrics,
  getGridImportCapacityMetrics,
  wattsToKilowatts,
  type EnergyRecord,
} from "./zympler-actions";

const record = ({
  timestamp = "2026-03-23T00:00:00Z",
  importPower = 0,
  importLimit = 750_000,
  exportPower = 0,
  exportLimit = 500_000,
  overrides = {},
}: {
  timestamp?: string;
  importPower?: number | null;
  importLimit?: number | null;
  exportPower?: number | null;
  exportLimit?: number | null;
  overrides?: Partial<EnergyRecord>;
} = {}): EnergyRecord => ({
  interval: { start: timestamp, end: "2026-03-23T00:15:00Z" },
  from_grid: { power: importPower },
  from_grid_limit: { power: importLimit },
  to_grid: { power: exportPower },
  to_grid_limit: { power: exportLimit },
  ...overrides,
});

describe("bidirectional grid capacity", () => {
  it("calculates planned grid import maximum utilisation", () => {
    const metrics = getGridImportCapacityMetrics([
      record({ importPower: 400_000 }),
      record({ importPower: 575_000, timestamp: "2026-03-23T02:00:00Z" }),
    ]);
    expect(metrics.maximumUtilisationPoint).toMatchObject({
      powerWatts: 575_000,
      limitWatts: 750_000,
      headroomWatts: 175_000,
    });
    expect(metrics.maximumUtilisationPoint?.utilisationPercentage).toBeCloseTo(76.667);
  });

  it("calculates planned grid export maximum utilisation", () => {
    const metrics = getGridExportCapacityMetrics([
      record({ exportPower: 120_000 }),
      record({ exportPower: 240_000, timestamp: "2026-03-23T12:15:00Z" }),
    ]);
    expect(metrics.maximumUtilisationPoint).toMatchObject({
      powerWatts: 240_000,
      limitWatts: 500_000,
      headroomWatts: 260_000,
    });
  });

  it("calculates actual grid import maximum utilisation", () => {
    const telemetry = [record({ importPower: 696_000, importLimit: 750_000 })];
    expect(getGridImportCapacityMetrics(telemetry).maximumUtilisationPoint?.powerWatts).toBe(
      696_000,
    );
  });

  it("calculates actual grid export maximum utilisation", () => {
    const telemetry = [record({ exportPower: 305_000, exportLimit: 500_000 })];
    expect(getGridExportCapacityMetrics(telemetry).maximumUtilisationPoint?.powerWatts).toBe(
      305_000,
    );
  });

  it("retains the timestamp belonging to the maximum interval", () => {
    const timestamp = "2026-03-23T13:15:00Z";
    const metrics = getGridImportCapacityMetrics([
      record({ importPower: 100_000 }),
      record({ importPower: 600_000, timestamp }),
    ]);
    expect(metrics.maximumUtilisationPoint?.timestamp).toBe(timestamp);
  });

  it("pairs import power with a varying limit at the same interval", () => {
    const metrics = getGridImportCapacityMetrics([
      record({ importPower: 600_000, importLimit: 750_000 }),
      record({ importPower: 500_000, importLimit: 550_000 }),
    ]);
    expect(metrics.maximumUtilisationPoint).toMatchObject({
      powerWatts: 500_000,
      limitWatts: 550_000,
    });
  });

  it("pairs export power with a varying limit at the same interval", () => {
    const metrics = getGridExportCapacityMetrics([
      record({ exportPower: 300_000, exportLimit: 500_000 }),
      record({ exportPower: 250_000, exportLimit: 300_000 }),
    ]);
    expect(metrics.maximumUtilisationPoint).toMatchObject({
      powerWatts: 250_000,
      limitWatts: 300_000,
    });
  });

  it("distinguishes maximum utilisation from maximum absolute power", () => {
    const metrics = getGridImportCapacityMetrics([
      record({ importPower: 700_000, importLimit: 1_000_000 }),
      record({ importPower: 500_000, importLimit: 600_000 }),
    ]);
    expect(metrics.maximumPowerPoint?.powerWatts).toBe(700_000);
    expect(metrics.maximumUtilisationPoint?.powerWatts).toBe(500_000);
  });

  it("reports within-limit status", () => {
    expect(getGridImportCapacityMetrics([record({ importPower: 500_000 })]).status).toBe(
      "within-limit",
    );
  });

  it("reports approaching-limit status at the named threshold", () => {
    expect(
      getGridImportCapacityMetrics([record({ importPower: 675_000, importLimit: 750_000 })]).status,
    ).toBe("approaching-limit");
  });

  it("reports exceeded status", () => {
    expect(
      getGridImportCapacityMetrics([record({ importPower: 800_000, importLimit: 750_000 })]).status,
    ).toBe("exceeded");
  });

  it("calculates headroom", () => {
    expect(
      getGridImportCapacityMetrics([record({ importPower: 575_000 })]).maximumUtilisationPoint
        ?.headroomWatts,
    ).toBe(175_000);
  });

  it("calculates exceeded amount and clamps only visual percentage", () => {
    const point = getGridImportCapacityMetrics([
      record({ importPower: 840_000, importLimit: 750_000 }),
    ]).maximumUtilisationPoint;
    expect(point?.exceededByWatts).toBe(90_000);
    expect(point?.utilisationPercentage).toBeCloseTo(112);
    expect(point?.visualPercentage).toBe(100);
  });

  it("converts W to kW", () => {
    expect(wattsToKilowatts(175_000)).toBe(175);
  });

  it("handles missing telemetry", () => {
    expect(getGridImportCapacityMetrics([])).toEqual({
      maximumUtilisationPoint: null,
      maximumPowerPoint: null,
      status: "unavailable",
    });
  });

  it("ignores a zero grid limit", () => {
    expect(
      getGridImportCapacityMetrics([record({ importPower: 100_000, importLimit: 0 })]).status,
    ).toBe("unavailable");
  });

  it("chooses the earliest timestamp when maximum values are equal", () => {
    const metrics = getGridImportCapacityMetrics([
      record({ importPower: 500_000, timestamp: "2026-03-23T05:00:00Z" }),
      record({ importPower: 500_000, timestamp: "2026-03-23T03:00:00Z" }),
    ]);
    expect(metrics.maximumUtilisationPoint?.timestamp).toBe("2026-03-23T03:00:00Z");
  });

  it("formats local dashboard time in 24-hour format", () => {
    expect(formatDashboardTime("2026-03-23T12:15:00Z", "Europe/Amsterdam")).toBe("13:15");
    expect(formatDashboardTime("invalid", "Europe/Amsterdam")).toBe("Time unavailable");
  });
});

describe("daily actions", () => {
  it("uses planning records and identifies grid import explicitly", () => {
    const actions = getDailyZymplerActions([record({ importPower: 500_000 })]);
    expect(actions.some((action) => action.title.includes("planned grid import"))).toBe(true);
  });

  it("uses timestamp durations for battery supply", () => {
    const records = [
      record({
        overrides: {
          interval: { start: "2026-03-23T01:00:00Z", end: "2026-03-23T01:20:00Z" },
          breakdown: { used_from_battery: { power: 10_000 } },
        },
      }),
      record({
        overrides: {
          interval: { start: "2026-03-23T02:00:00Z", end: "2026-03-23T02:40:00Z" },
          breakdown: { used_from_battery: { power: 20_000 } },
        },
      }),
    ];
    expect(getBatterySupplyDurationHours(records)).toBeCloseTo(1);
  });

  it("calculates directly consumed solar without double counting", () => {
    const records = [
      record({ overrides: { breakdown: { used_from_solar: { energy: 2_500, power: 10_000 } } } }),
      record({ overrides: { breakdown: { used_from_solar: { energy: 1_250 } } } }),
    ];
    expect(getDirectSolarEnergy(records)).toBe(3_750);
  });
});
