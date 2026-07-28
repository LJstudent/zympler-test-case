import { describe, expect, it } from "vitest";

import type { EnergyDataRow } from "~/features/energy-data";

import {
  buildSolarActivity,
  calculateDailySolarGeneration,
  createSolarAssetCardViewModel,
} from "./solar-asset-card-view-model";

function solarRow(start: string, solarGenerationKwh: number, flowEnergyKwh = 0): EnergyDataRow {
  return {
    start: new Date(start),
    end: new Date(new Date(start).getTime() + 15 * 60 * 1_000),
    measurement: {
      hbe: 0,
      pricePerKwh: null,
      gridImportKwh: 0,
      gridExportKwh: 0,
      solarGenerationKwh,
      batteryChargeKwh: 0,
      batteryDischargeKwh: 0,
      chargerEnergyKwh: 0,
      batterySoc: { solarOrigin: null, gridOrigin: null },
    },
    flows: {
      solar: {
        toBatteryKwh: flowEnergyKwh,
        toGridKwh: flowEnergyKwh,
        toChargerKwh: flowEnergyKwh,
      },
      grid: { toBatteryKwh: 0, toChargerKwh: 0 },
      battery: {
        solarOrigin: { toGridKwh: 0, toChargerKwh: 0 },
        gridOrigin: { toGridKwh: 0, toChargerKwh: 0 },
      },
      charger: { totalFromSolarKwh: 0, totalFromGridKwh: 0 },
    },
  };
}

describe("solar asset card view model", () => {
  it("selects the latest valid day and sorts generation chronologically", () => {
    const viewModel = createSolarAssetCardViewModel([
      solarRow("2025-12-31T00:15:00Z", 1_000),
      solarRow("2025-12-30T23:45:00Z", 500),
      solarRow("2025-12-31T00:00:00Z", 1_480),
      solarRow("2026-01-01T00:00:00Z", -1),
    ]);

    expect(viewModel?.activity).toEqual([
      {
        timestamp: new Date("2025-12-31T00:00:00Z").getTime(),
        generatedKwh: 1_480,
      },
      {
        timestamp: new Date("2025-12-31T00:15:00Z").getTime(),
        generatedKwh: 1_000,
      },
    ]);
    expect(viewModel?.generatedDisplay).toBe("2.48 MWh");
  });

  it("uses dedicated total generation rather than summing destination flows", () => {
    const rows = [
      solarRow("2025-12-31T00:00:00Z", 80, 1_000),
      solarRow("2025-12-31T00:15:00Z", 20, 2_000),
    ];

    expect(calculateDailySolarGeneration(rows)).toBe(100);
    expect(buildSolarActivity(rows).map((point) => point.generatedKwh)).toEqual([80, 20]);
  });

  it("preserves a valid zero-generation day", () => {
    expect(createSolarAssetCardViewModel([solarRow("2025-12-31T00:00:00Z", 0)])).toMatchObject({
      generatedDisplay: "0 kWh",
    });
  });

  it("returns empty when no valid solar measurements exist", () => {
    expect(
      createSolarAssetCardViewModel([
        solarRow("2025-12-31T00:00:00Z", Number.NaN),
        solarRow("2025-12-31T00:15:00Z", -1),
      ]),
    ).toBeNull();
  });
});
