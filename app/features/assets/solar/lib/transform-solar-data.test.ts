import { describe, expect, it } from "vitest";

import type { EnergyDataRow } from "~/features/energy-data";

import { transformSolarData } from "./transform-solar-data";

function row(
  start: string,
  productionKwh: number,
  toChargerKwh: number,
  toBatteryKwh: number,
  toGridKwh: number,
): EnergyDataRow {
  const startDate = new Date(start);
  return {
    start: startDate,
    end: new Date(startDate.getTime() + 15 * 60_000),
    measurement: {
      hbe: 0,
      pricePerKwh: 0.2,
      gridImportKwh: 0,
      gridExportKwh: 0,
      solarGenerationKwh: productionKwh,
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

describe("transformSolarData", () => {
  it("aggregates with shared time buckets and keeps stacks equal to production", () => {
    const data = transformSolarData(
      [row("2025-01-01T00:00:00Z", 10, 2, 3, 1), row("2025-01-01T00:15:00Z", 20, 4, 5, 2)],
      "day",
      "combined",
      "2025-01-01",
    );

    expect(data).toHaveLength(1);
    expect(data[0].totalSolar).toBe(30);
    expect(
      data[0].ownUse + data[0].solarToCharger + data[0].solarToBattery + data[0].solarToGrid,
    ).toBeCloseTo(data[0].totalSolar);
  });

  it("scales over-allocated flows and never produces a negative own-use value", () => {
    const [datum] = transformSolarData(
      [row("2025-01-01T00:00:00Z", 10, 8, 8, 4)],
      "day",
      "raw",
      "2025-01-01",
    );

    expect(datum.ownUse).toBe(0);
    expect(datum.solarToCharger + datum.solarToBattery + datum.solarToGrid).toBeCloseTo(10);
  });
});
